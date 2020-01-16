<?php
include("conexao.php");

$json_angular = file_get_contents('php://input'); 
$json_request = json_decode($json_angular);

$email = $json_request->emailAddress;
$firstname = $json_request->firstname;
$lastname = $json_request->lastname;
$country = $json_request->country;
$streetaddress = $json_request->streetaddress;
$other = $json_request->other;
$towncity = $json_request->towncity;
$postcode = $json_request->postcode;
$phone = $json_request->phone;

$query = mysqli_query($con, "SELECT * FROM clientes WHERE email='$email'");

$retorno = null;

if (!$query) {

   $retorno = array( "retorno" => false, "mensagem" => mysql_errno().": ".mysql_error() , "error" => true);

} else {

  $resultado = mysqli_fetch_array($query);

  if ($resultado) {
      $query = mysqli_query($con, "UPDATE clientes SET firstname='$firstname', lastname='$lastname', country='$country', streetaddress='$streetaddress', other='$other', towncity='$towncity', postcode='$postcode', phone='$phone' WHERE email='$email'");

      if (!$query) {
	$retorno = array( "retorno" => false, "mensagem" => mysql_errno().": ".mysql_error() , "error" => true);
      } else {
	$retorno = array( "retorno" => true, "mensagem" => "", "error" => false);
      }

  } else {

    $query = mysqli_query($con, "INSERT INTO clientes(email,firstname,lastname,country,streetaddress,other,towncity,postcode,phone) VALUES ('$email','$firstname','$lastname','$country','$streetaddress','$other','$towncity','$postcode','$phone')");

    if (!$query) {
       $retorno = array( "retorno" => false, "mensagem" => mysql_errno().": ".mysql_error() , "error" => true);
    } else {
       $retorno = array( "retorno" => true, "mensagem" => "", "error" => false);
    }
 }

 mysqli_free_result($resultado);

}

mysqli_close($con);

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 01 Jan 1996 00:00:00 GMT');
header('Content-type: application/json; charset=UTF-8');

echo json_encode($retorno);

?>
