 <?php
// FICHERO: api/get/categorias.php
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
//   api/categorias  -------------------> devuelve todas las categorias
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../inc/config.php'); // Constantes, etc ...
require_once('../inc/database.php');

// =================================================================================
// Se instancia la BD y se pilla la conexión
// =================================================================================
$db    = new Database(); // Base de datos
$dbCon = $db->getConnection(); // Conexión a la base de datos
// =================================================================================
// CONFIGURACIÓN DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// SE ANALIZA LA PETICIÓN Y SE SEPARA RECURSO Y PARÁMETROS DE LA PETICIÓN
// =================================================================================
// analizarPeticion($_SERVER['QUERY_STRING'], $RECURSO, $PARAMS);
analizarPeticion($RECURSO, $PARAMS);
// =================================================================================
// SE PREPARA LA RESPUESTA
// =================================================================================
$R             = [];  // Almacenará el resultado.
$RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
// sql base de la consulta
$mysql = 'select * from categoria order by nombre'; // orden de los resultados
// Se hace la petición
$RESPUESTA = $db->select($mysql);
if( $RESPUESTA['CORRECTO'] ) // execute query OK
{
    $RESPONSE_CODE  = 200;
    $R['RESULTADO'] = 'OK';
    $R['FILAS']     = $RESPUESTA['RESULT'];
}
else
{
    $RESPONSE_CODE    = 500;
    $R['RESULTADO']   = 'ERROR' ;
    $R['DESCRIPCION'] = 'Se ha producido un error en el servidor al ejecutar la consulta.';
    $R['ERROR']       = $RESULTADO['ERROR'];
}
$R = ['CODIGO'=>$RESPONSE_CODE] + $R;
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
echo json_encode($R);
?>
