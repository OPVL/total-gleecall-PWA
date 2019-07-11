<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once "AccessToken.php";
require_once "AuthCode.php";
require_once "RestToken.php";
require_once "Logger.php";


if (isset($_GET['username']) && isset($_GET['password'])) {
    $tokens = RestToken::get(false, [$_GET['username'], $_GET['password']]);
    // $tokens = RestToken::get(false);

    if (!$tokens['BhRestToken']) {
        // header("Location: /gleesons/login?status=danger&message=1");
        die('token is borked');
    }

    header('Content-Type: application/json');
    echo json_encode($tokens);

    // die($tokens);
    setcookie("BhRestToken", $tokens['BhRestToken'], time() + 600, '/');
    setcookie("refresh_token", $tokens['refresh_token'], time() + 60 * 60 * 24 * 30, '/');
    setcookie("restUrl", $tokens['restUrl'], time() + 60 * 60 * 24 * 30, '/');

    // header("Location: /gleesons/" . ($_POST['origin'] . $_POST['term']) ?? 'dashboard');
}

if (isset($_GET['refresh'])) {
    $tokens = RestToken::refresh(false, $_GET['refresh'] ?? $_COOKIE['refresh_token']);

    if (!$tokens['BhRestToken']) {
        setcookie("BhRestToken", "", 0, '/');
        setcookie("refresh_token", "", 0, '/');
        die('invalid');
        return json_encode(tokens);
    }

    setcookie("BhRestToken", $tokens['BhRestToken'], time() + $tokens['expires_in'], '/');
    setcookie("refresh_token", $tokens['refresh_token'], time() + 60 * 60 * 24 * 30, '/');
    setcookie("restUrl", $tokens['restUrl'], time() + 60 * 60 * 24 * 30, '/');

    die(json_encode($tokens));
}
