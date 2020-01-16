<?php
include("conexao.php");

$email = @file_get_contents('php://input');
$query = mysqli_query($con, "SELECT * FROM clientes WHERE email='$email'");

$retorno = null;

if (!$query) {

   $retorno = array( "retorno" => false, "mensagem" => mysql_errno().": ".mysql_error() , "error" => true);

} else {

  $resultado = mysqli_fetch_array($query);

  if ($resultado) {

    $cliente = array( "emailAddress" => $resultado['email'], "firstname" => $resultado['firstname'], "lastname" => $resultado['lastname'],  "country" => $resultado['country'],  "streetaddress" => $resultado['streetaddress'], "other" => $resultado['other'], "towncity" => $resultado['towncity'], "postcode" => $resultado['postcode'], "phone" => $resultado['phone']);
    $retorno = array( "retorno" => true, "mensagem" => "", "error" => false, "cliente" => $cliente);

  } else {

    $retorno = array( "retorno" => false, "mensagem" => "", "error" => false);

  }

  mysqli_free_result($resultado);

}

mysqli_close($con);

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 01 Jan 1996 00:00:00 GMT');
header('Content-type: application/json; charset=UTF-8');

echo json_encode($retorno);

?>
