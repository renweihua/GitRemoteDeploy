<?php
/**
 * Git Remote Deploy
 *
 * Copyright 2019-2020 leo <2579186091@qq.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace app\queue\lib;

use app\model\branch_list;
use app\model\project;
use app\model\server;
use app\model\update_timing;
use ext\conf;
use ext\http;
use ext\redis;

class update
{
    public function start($id)
    {
        $update_info = update_timing::new()->where([['id', $id], ['status', 0]])->get_one();
        if (empty($update_info)) {
            return;
        }
        $proj_id     = $update_info['proj_id'];
        $branch_id   = $update_info['branch_id'];
        $branch_info = branch_list::new()->where([['proj_id', $proj_id], ['branch_id', $branch_id]])->get_one();
        if (empty($branch_info)) {
            return;
        }
        if (!$branch_info['active']) {
            $data = [
                'c'           => 'project/proj_git-local_checkout',
                'proj_id'     => $proj_id,
                'branch_name' => $branch_info['branch_name']
            ];
            $this->lock($proj_id, $data);
        }


        $where = [
            ['proj_id', $proj_id],
            ['branch_id', $branch_id],
            ['status', 0],
            ['time', '<=', $update_info['time']]
        ];
        $data  = [
            'c'       => 'project/proj_git-local_update',
            'proj_id' => $proj_id
        ];
        $this->lock($proj_id, $data);
        update_timing::new()->where($where)->value(['status' => 1])->update_data();
    }

    /**
     * 加锁
     *
     * @param int   $proj_id
     * @param array $data
     *
     * @return bool
     * @throws \Exception
     */
    private function lock(int $proj_id, array $data)
    {
        $srv_list = project::new()->fields('srv_list')->where(['proj_id', $proj_id])->get_value();
        $srv_list = json_decode($srv_list, true);
        $count    = count($srv_list);
        if ($count <= 0) {
            return;
        }
        $redis = redis::create(conf::get('redis'))->connect();
        $key   = "proj_lock:" . $proj_id;
        if ($redis->exists($key)) {
            return false;
        }
        $redis->incrBy($key, $count);
        $redis->expire($key, 60);
        $servers = server::new()->where([['srv_id', 'IN', $srv_list]])->get();
        foreach ($servers as $server) {
            $ip   = $server['ip'];
            $port = $server['port'];
            $url  = "http://" . $ip . ":" . $port . "/api.php";
            $res  = http::new()->add(['url' => $url, 'data' => $data, 'with_header' => true])->fetch();
            if (!$res) {
                $key = 'gg_error:' . $this->proj_id;
                $redis->setex($key, 3600, '服务器请求出错');
            }
        }
        return true;
    }
}