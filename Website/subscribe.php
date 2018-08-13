<?php

// get the posted data
$email_address = $_POST['email'];

// write the email content
$email_content .= "Email Address: $email\n";

// send the email
mail ("office@companydomain.com", "New Website Subscriber", $email_content);

// send the user back to the form
header("Location: index.html"); exit;

?>

