function fillDishInfo(container, piatto) {
  $.post("php/menu.php", { request: "ingredients", dish: piatto["idPietanza"] }, function(output) {
    var template = retrieveTemplate("template-dishes");
    var ingredientsList = "";
    for (var i = 0; i < output["ingredient"].length; i++) {
      var ingrediente = output["ingredient"][i];
      ingredientsList += ingrediente["nome"] + ", ";
    }
    container.append(bindArgs(template, piatto["nome"], ingredientsList.slice(0, -2), piatto["idPietanza"], piatto["costo"]));
  }, "json");
}
function getCategoryDishes(container, categoryId) {
  $.post("php/menu.php", { request: "dishes", category: categoryId }, function(output) {
    for (var i = 0; i < output["dish"].length; i++)
      fillDishInfo(container, output["dish"][i]);
  }, "json");
}
function getNextVal(button) {
  var val = button.attr("class").indexOf("plus") > -1 ? 1 : -1;
  return parseInt(button.siblings("span").text()) + val;
}
function pressable(button) {
  return button.attr("class").indexOf("disabled") < 0;
}
function updateButtonsState(button, orderDetails) {
  if (!$.isEmptyObject(orderDetails))
    $("#checkout").removeClass("disabled");
  else
    $("#checkout").addClass("disabled");

  if (button.attr("class").indexOf("plus") > -1 && getNextVal(button) == 1)
    button.siblings(".fa-minus-square").removeClass("disabled");

  if (button.attr("class").indexOf("minus") > -1 && getNextVal(button) == 0)
    button.addClass("disabled");
}
function updateOrderDetails(orderDetails ,dishName, quantity, price) {
  orderDetails[dishName] = { quantity : quantity, price : price.slice(1)};
  if (quantity == 0)
    delete orderDetails[dishName];
  return orderDetails;
}
$(function() {
  var orderDetails = {};
  $.post("php/menu.php", { request: "categories" }, function(output) {
    var template = retrieveTemplate("template-categories");
    for (var i = 0; i < output["category"].length; i++) {
      var categoria = output["category"][i];
      $(".instance-categories").append(bindArgs(template, categoria["nome"]));
      getCategoryDishes($(".instance-categories .instance-dishes").last(), categoria["idCategoria"]);
    }
  }, "json");
  $(".instance-categories").on("click", ".fas", function() {
    if (!pressable($(this)))
      return;
    orderDetails = updateOrderDetails(orderDetails, $(this).parent().siblings(".col-8").find("h5").text(),
                                      getNextVal($(this)), $(this).siblings("h5").text());
    updateButtonsState($(this), orderDetails);
    $(this).siblings("span").text(getNextVal($(this)));
  });
  $("#checkout").click(function() {
    if (!pressable($(this)))
      return;
    $.post("php/sessionAPI.php", { req: "set", var: "orderDetails" , val : orderDetails });
    loadPage("checkout");
  });
  $("#cancel").click(function() {
    $.post("php/sessionAPI.php", { req: "del", var: "choosenRest" });
    $("[name*='restaurants']").click();
  });
});
