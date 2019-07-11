<?php

require_once 'Logger.php';

class RestToken
{
    public static $params = [
        CURLOPT_FOLLOWLOCATION => 0,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_POST => 1
    ];

    /**
     * Returns BhRestToken & RestUrl
     * 
     * @param string $token Access Token - AccessToken::get()
     * @param string $version specify what version of the API you want or use the latest
     * 
     * @return array associative array containing the RestToken and RestUrl
     */
    public static function get(bool $justToken, array $credentials = null)
    {
        $auth = AuthCode::get($credentials);
        $access = AccessToken::get(false, $auth, null);

        if (!$auth || !$access) {
            return [];
        }
        // return NULL;
        $url = "https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=" . $access['access_token'];
        $ch = curl_init($url);
        curl_setopt_array($ch, RestToken::$params);
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            Log::fatal(curl_error($ch));
            die('rats... ' . curl_error($ch));
        }

        curl_close($ch);
        $response = json_decode($response, true);

        Log::info("RestToken Created: " . $response['BhRestToken']);

        if ($justToken)
            return json_encode("{ 'token':'" . $response['BhRestToken'] . "' }");

        $response = array_merge($response, $access);

        return $response;
    }

    public static function refresh(bool $justToken, string $refresh)
    {
        $access = AccessToken::get($justToken, null, $refresh);

        if (!$access) {
            return [];
        }
        // return NULL;
        $url = "https://rest.bullhornstaffing.com/rest-services/login?version=*&access_token=" . $access['access_token'];
        $ch = curl_init($url);
        curl_setopt_array($ch, RestToken::$params);
        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            Log::fatal(curl_error($ch));
            die('rats... ' . curl_error($ch));
        }

        curl_close($ch);
        $response = json_decode($response, true);

        Log::info("RestToken Created: " . $response['BhRestToken']);

        if ($justToken)
            return json_encode("{ 'token':'" . $response['BhRestToken'] . "' }");

        $response = array_merge($response, $access);

        return $response;
    }
}