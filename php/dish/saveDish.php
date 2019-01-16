<?php
  foreach (glob('../utils/*.php') as $f) require_once $f;

  $dishID = insertDish($_POST["name"], $_POST["price"], $_POST["category"], $_SESSION["username"]);

  if (isset($_POST["ingredients"]))
    foreach($_POST["ingredients"] as $ingredientID)
      bindIngredientWithDish($ingredientID, $dishID);

  closeWithoutErrors(array());
?>
