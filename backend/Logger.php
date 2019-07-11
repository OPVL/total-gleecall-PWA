<?php
require_once 'Database.php';
class Log
{
    public static $table = 'event_log';

    /**
     * Logs events in to the database, has overload methods for default success, fail, info
     * @param string $msg   save data
     * @param int|enum $type INFO | SUCCESS | FAIL | FATAL
     * @return bool save ? TRUE : FALSE
     */
    public static function save($msg, $type = 'CUSTOM')
    {
        $conn = DatabaseMisc::connect();

        $columns['message'] = "'$msg'";
        $columns['category'] = "'$type'";
        $columns['time'] = time();
        $columns['ip'] = "'" . $_SERVER['REMOTE_ADDR'] . "'";

        $values = implode(',', array_values($columns));
        $columns = implode(',', array_keys($columns));

        $sql = "INSERT INTO " . Log::$table . " ( $columns ) VALUES ( $values )";

        if (!$conn->query($sql)) {
            die($conn->error);
        }

        return TRUE;
    }

    /**
     * logs a success event to the database
     * 
     * @param string $msg a description of the event
     * @return bool success or fail on save
     */
    public static function success($msg)
    {
        return Log::save($msg, 'SUCCESS');
    }

    /**
     * logs a failiure event to the database
     * 
     * @param string $msg a description of the event
     * @return bool success or fail on save
     */
    public static function fail($msg)
    {
        return Log::save($msg, 'FAIL');
    }

    /**
     * logs a fatal event to the database
     * 
     * @param string $msg a description of the event
     * @return bool success or fail on save
     */
    public static function fatal($msg)
    {
        return Log::save($msg, 'FATAL');
    }

    /**
     * logs an info event to the database
     * 
     * @param string $msg a description of the event
     * @return bool success or fail on save
     */
    public static function info($msg)
    {
        return Log::save($msg, 'INFO');
    }
}