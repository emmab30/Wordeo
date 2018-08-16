<?php

function rudr_mailchimp_subscriber_status( $email, $status, $list_id, $api_key, $merge_fields = array('FNAME' => '','LNAME' => '') ){
	$data = array(
		'apikey'        => $api_key,
    	'email_address' => $email,
    	'language' 		=> substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2),
		'status'        => $status,
		'merge_fields'  => $merge_fields
	);
	$mch_api = curl_init(); // initialize cURL connection

	curl_setopt($mch_api, CURLOPT_URL, 'https://' . substr($api_key,strpos($api_key,'-')+1) . '.api.mailchimp.com/3.0/lists/' . $list_id . '/members/' . md5(strtolower($data['email_address'])));
	curl_setopt($mch_api, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Authorization: Basic '.base64_encode( 'user:'.$api_key )));
	curl_setopt($mch_api, CURLOPT_USERAGENT, 'PHP-MCAPI/2.0');
	curl_setopt($mch_api, CURLOPT_RETURNTRANSFER, true); // return the API response
	curl_setopt($mch_api, CURLOPT_CUSTOMREQUEST, 'PUT'); // method PUT
	curl_setopt($mch_api, CURLOPT_TIMEOUT, 10);
	curl_setopt($mch_api, CURLOPT_POST, true);
	curl_setopt($mch_api, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($mch_api, CURLOPT_POSTFIELDS, json_encode($data) ); // send data in json

	$result = curl_exec($mch_api);
	$result = json_decode($result, true);
	die(var_dump($result));
	if($result != null && isset($result['id'])) {
		return true;
	}

	return false;
}

$email 			= $_POST['email'];
$FNAME			= $_POST['name'];
$status 		= 'subscribed';
$list_id 		= '088e6b2ed5';
$api_key 		= '70aed39d6362bd77c7a3fab5d72d8864-us18';
$merge_fields 	= array(
	'FNAME' 	=> $FNAME,
	'REFERER' 	=> 'https://www.wordeoo.com'
);

$data = [];
if(rudr_mailchimp_subscriber_status($email, $status, $list_id, $api_key, $merge_fields )) {
	$data = [
		'success' => true
	];
} else {
	$data = [
		'success' => false,
		'message' => 'Aparentemente no te hemos podido suscribir a nuestra lista. Por favor, inténtalo luego.'
	];
}

header('Content-Type: application/json');
echo json_encode($data);

?>