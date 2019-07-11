<?php
require_once 'Logger.php';

class AuthCode
{
    static $params = [
        CURLOPT_FOLLOWLOCATION => 0,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HEADER => 1
    ];

    public static function buildUrl(array $config, array $credentials = null)
    {
        try {
            $client = $config['CLIENT_ID'];
            $username = $credentials[0] ?? $config['USERNAME'];
            $password = $credentials[1] ?? $config['PASSWORD'];
            $url = $config['OAUTH_URL'];

            return "$url/authorize?client_id=$client&response_type=code&username=$username&password=$password&action=Login";
        } catch (Exception $e) {
            echo $e;
            return null;
        }
    }

    /**
     * Returns the Auth Code which is then used to get the access code
     * 
     * @return string Auth Code
     */
    public static function get(array $credentials = null)
    {
        $url = AuthCode::buildUrl(parse_ini_file('config.ini'), $credentials);
        try {
            $ch = curl_init($url);
            curl_setopt_array($ch, AuthCode::$params);
            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                Log::fatal(curl_error($ch));
                die('rats... ' . curl_error($ch));
            }

            curl_close($ch);

            if (preg_match("|Location: (https?://\S+)|", $response, $m)) {
                //Location is in $m[1]
                if (preg_match("|code=(\S+)\&client_id|", $m[1], $n)) {
                    $code = urldecode($n[1]);
                    Log::info("AuthCode Created: $code");
                    return $code;
                }
            }
            return null;
        } catch (Exception $e) {
            Log::fatal($e);
        }
    }
}