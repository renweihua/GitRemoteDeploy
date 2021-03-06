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

namespace app\user;

use app\enum\error_enum;
use app\library\base;
use app\model\user;

class ctrl extends base
{
    public $tz          = '*';
    public $check_token = false;

    /**
     * 登录
     *
     * @param string $acc
     * @param string $pwd
     *
     * @return array
     * @throws \Exception
     */
    public function login(string $acc, string $pwd): array
    {
        $cnt = user::new()->count();
        if ($cnt == 0) {
            $this->make_user($acc, $pwd);
        }
        $user = user::new()->where(['user_acc', $acc])->fields('*')->get_one();
        if (empty($user)) {
            return $this->response(error_enum::NO_USER);
        }
        if ($user['user_pwd'] != $this->get_pwd($pwd, $user['user_entry'])) {
            return $this->response(error_enum::PW_ERROR);
        }
        $token = $this->make(['user_id' => $user['user_id'], 'expire' => time() + 3600 * 24 * 7]);
        setcookie('gg_token', $token);
        return $this->succeed();
    }

    private function make_user($acc, $pwd)
    {
        $entry = $this->get_rand_str();
        $pwd   = $this->get_pwd($pwd, $entry);
        user::new()->value(['user_acc' => $acc, 'user_pwd' => $pwd, 'user_entry' => $entry])->insert_data();
    }

    private function get_pwd($pwd, $salt)
    {
        return md5(md5($pwd) . md5($salt));
    }

    private function get_rand_str($len = 6, $type = 'str')
    {
        if ($type == 'str') {
            $arr = array_merge(range(0, 9), range('a', 'z'), range('A', 'Z'));
        } else {
            $arr = array_merge(range(0, 9));
        }
        shuffle($arr);
        $sub_arr = array_slice($arr, 0, $len);
        return implode('', $sub_arr);
    }
}