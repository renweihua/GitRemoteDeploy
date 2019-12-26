<?php
/**
 * Created by PhpStorm.
 * User: Jerry
 * Date: 8/21/2019
 * Time: 10:36 AM
 * Note: master.php
 */

namespace app\queue;

use app\lib\base;
use ext\conf;
use ext\queue;

class master extends queue
{
    public $tz = ['start', 'unit'];

    /**
     * master constructor.
     */
    public function __construct()
    {
        parent::__construct(conf::get('redis'));
    }

    /**
     * 最多启动4个子进程
     *
     * @param int $max_fork
     * @param int $max_exec
     *
     * @throws \Exception
     */
    public function start(int $max_fork = 12, int $max_exec = 1000): void
    {
        $this->set_name('gitget')->go($max_fork, $max_exec); // TODO: Change the autogenerated stub
    }
}
