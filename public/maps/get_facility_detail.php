<?php

$id=0;
if(isset($_GET['id'])) $id=$_GET['id'];

echo json_encode($id);
?>