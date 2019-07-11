<?php
class DatabaseMisc
{
    public static function getConfig()
    {
        try {
            $config = parse_ini_file('config.ini');
        } catch (Exception $e) {
            throw $e->getMessage();
        }
        return [
            'host' => $config['DB_HOST'],
            'port' => $config['DB_PORT'],
            'user' => $config['DB_USER'],
            'password' => $config['DB_PASS']
        ];
    }
    public static function jsonError(string $msg)
    {
        $json = [
            'error' => $msg,
        ];
        return (json_encode($json));
    }
    public static function connect()
    {
        $conf = DatabaseMisc::getConfig();

        $conn = new mysqli($conf['host'], $conf['user'], $conf['password'], 'gleecall', $conf['port']);
        // Check connection
        if ($conn->connect_error) {
            die(DatabaseMisc::jsonError("Connection failed: " . $conn->connect_error));
        }
        return $conn;
    }
}