var app = angular.module('myApp', ['ngMaterial']);

function isNullOrEmpty(val) {
  return val == undefined || val == null || val.length == 0;
}

function formatMoney(number) {
  return formatNumber(number, 2, 3, '.', ',');
}

function formatNumber(number, decimals, integers, intSeparator, decSeparator) {
  var regex = '\\d(?=(\\d{' + (integers || 3) + '})+' + (decimals > 0 ? '\\D' : '$') + ')';
  if (isNaN(number)) {
  return number;
  }
  var aux = number.toFixed(Math.max(0, ~~decimals));
  return (decSeparator != null ? aux.replace('.', decSeparator) : aux).replace(new RegExp(regex, 'g'), '$&' + (intSeparator || ''));
};

function setFocus(id) {
  setTimeout(function() {
    $(id).focus();
  }, 250);
}

app.controller("ShopController", function($http, $scope, $rootScope, $window, $q, $mdDialog) {

  var controller = this;

  controller.itens = [];
  controller.subtotal = 0;
  controller.delivery = 0;
  controller.desconto = 0;
  controller.total = 0;

  controller.cliente = {};
  controller.emailAddress = null;
  controller.edicaoCliente = false;

  controller.onReady = function() {

    if (!isNullOrEmpty($window.sessionStorage.itens)) {
      controller.itens = angular.fromJson($window.sessionStorage.itens);
      controller.calculaTotal();
    }

    if (!isNullOrEmpty($window.sessionStorage.cliente)) {
      controller.cliente = angular.fromJson($window.sessionStorage.cliente);
    }

    var input = document.getElementById("email_address");
    input.addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        controller.pesquisarCliente();
      }
    });

  };

  $scope.showAlert = function(msg) {
    $mdDialog.show(
      $mdDialog.alert()
      .parent(angular.element(document.querySelector('#popupContainer')))
      .clickOutsideToClose(true)
      .title('Cliente')
      .textContent(msg)
      .ok('Ok')
    );
  };

  controller.calculaTotal = function() {
    controller.subtotal = 0;
    controller.delivery = 0;
    controller.desconto = 0;
    controller.total = 0;

    for (var i = 0; i < controller.itens.length; i++) {
        controller.subtotal+=controller.itens[i].valorSubtotalItem;
        controller.desconto+=controller.itens[i].valorDescontoItem;
        controller.total+=controller.itens[i].valorTotalItem;
    }
  }

  controller.formataValor = function(valor) {
    return formatMoney(valor);
  }

  controller.somaQuantidade = function(item) {
    item.quantidade++;

    item.valorSubtotalItem = (item.precoUnitario * item.quantidade);
    item.valorDescontoItem = (item.valorDescontoUnitario * item.quantidade);
    item.valorTotalItem = (item.valorSubtotalItem - item.valorDescontoItem);

    $window.sessionStorage.itens = angular.toJson(controller.itens);

    controller.calculaTotal();

  }

  controller.subtraiQuantidade = function(item) {
    if (item.quantidade > 1) {
        item.quantidade--;

        item.valorSubtotalItem = (item.precoUnitario * item.quantidade);
        item.valorDescontoItem = (item.valorDescontoUnitario * item.quantidade);
        item.valorTotalItem = (item.valorSubtotalItem - item.valorDescontoItem);

        $window.sessionStorage.itens = angular.toJson(controller.itens);

        controller.calculaTotal();
    }
  }

  controller.abrirCarrinho = function(descricao, imagem, precoUnitario, precoUnitarioComDesconto) {
      controller.adicionarCarrinho(descricao, imagem, precoUnitario, precoUnitarioComDesconto);
      window.location.href = "cart.html";
  }

  controller.adicionarCarrinho = function(descricao, imagem, precoUnitario, precoUnitarioComDesconto) {

    var sequencia = 0;

    for (var i = 0; i < controller.itens.length; i++) {
        if (controller.itens[i].sequencia > sequencia) {
          sequencia = controller.itens[i].sequencia;
        }
    }

    novoItem = {};
    novoItem.descricao = descricao;
    novoItem.imagem = imagem;
    novoItem.quantidade = 1;
    novoItem.precoUnitario = precoUnitario;
    novoItem.precoUnitarioComDesconto = precoUnitarioComDesconto;
    novoItem.valorDescontoUnitario = precoUnitarioComDesconto > 0 ? (precoUnitario - precoUnitarioComDesconto) : 0;
    novoItem.valorUnitarioItem = (novoItem.precoUnitario - novoItem.valorDescontoUnitario);
    novoItem.valorSubtotalItem = (novoItem.precoUnitario * novoItem.quantidade);
    novoItem.valorDescontoItem = (novoItem.valorDescontoUnitario * novoItem.quantidade);
    novoItem.valorTotalItem = (novoItem.valorSubtotalItem - novoItem.valorDescontoItem);
    novoItem.sequencia = sequencia+1;

    controller.itens.push(novoItem);

    $window.sessionStorage.itens = angular.toJson(controller.itens);

    controller.calculaTotal();      
  }

  controller.removerItem = function(sequencia) {
    for (var i = 0; i < controller.itens.length; i++) {
      var item = controller.itens[i];
      if (!isNullOrEmpty(item.sequencia)) {
        if (item.sequencia == sequencia) {
          controller.itens.splice(i, 1);
          break;
        }
      }
    }

    $window.sessionStorage.itens = angular.toJson(controller.itens);

    controller.calculaTotal();
  }

  controller.pesquisarCliente  = function() {

    if (isNullOrEmpty(controller.emailAddress)) {
        $scope.showAlert("Informe o email do cliente");
	setFocus("#email_address");
        return;
    }

    controller.cliente = {};
    controller.edicaoCliente = false;

    $http.post('consultacliente.php', controller.emailAddress)
    .success(function(data) {

      console.log(data);

      if (!data.retorno && !isNullOrEmpty(data.mensagem)) {
	$scope.showAlert(data.mensagem);
      }

      if (!data.retorno && !data.error) {
         controller.edicaoCliente = true;
	 setFocus("#firstname");

      } else if (data.retorno && !data.error) {
	controller.edicaoCliente = true;
	controller.cliente = data.cliente;
	setFocus("#firstname");
	
      } else {
	setFocus("#email_address");
      }

    }).error(function(err, stts) {
        console.log(err);
        var msgErro = isNullOrEmpty(err) ? 'Erro ao consultar cliente' : err;
        $scope.showAlert(msgErro);
	setFocus("#email_address");
    });

  }

  controller.fecharCarrinho = function(sequencia) {

    if (isNullOrEmpty(controller.emailAddress)) {
        $scope.showAlert("Informe o email do cliente");
	setFocus("#email_address");
        return;
    }

    if (isNullOrEmpty(controller.cliente.firstname)) {
        $scope.showAlert("Informe o primeiro nome do cliente");
	setFocus("#firstname");
        return;
    }

    if (isNullOrEmpty(controller.cliente.lastname)) {
        $scope.showAlert("Informe o ultimo nome do cliente");
	setFocus("#lastname");
        return;
    }

    if (isNullOrEmpty(controller.cliente.country)) {
        $scope.showAlert("Informe o pais do cliente");
	setFocus("#country");
        return;
    }

    if (isNullOrEmpty(controller.cliente.streetaddress)) {
        $scope.showAlert("Informe o endereco do cliente");
	setFocus("#streetaddress");
        return;
    }

    if (isNullOrEmpty(controller.cliente.towncity)) {
        $scope.showAlert("Informe a cidade do cliente");
	setFocus("#towncity");
        return;
    }

    if (isNullOrEmpty(controller.cliente.postcode)) {
        $scope.showAlert("Informe o CEP do cliente");
	setFocus("#postcode");
        return;
    }

    if (isNullOrEmpty(controller.cliente.phone)) {
        $scope.showAlert("Informe o Telefone do cliente");
	setFocus("#phone");
        return;
    }

    controller.cliente.emailAddress = controller.emailAddress;

    var dados = JSON.stringify(controller.cliente);

    $http.post('salvacliente.php', dados)
    .success(function(data) {

      console.log(data);

      if (!data.retorno && !isNullOrEmpty(data.mensagem)) {
	$scope.showAlert(data.mensagem);
      }

      if (data.retorno && !data.error) {
	$window.sessionStorage.clear();
	controller.cliente = {};
	controller.emailAddress = null;
	controller.edicaoCliente = false;
	
	window.location.href = "index.html";
      }

    }).error(function(err, stts) {
        console.log(err);
        var msgErro = isNullOrEmpty(err) ? 'Erro ao salvar cliente' : err;
        $scope.showAlert(msgErro);
    });

  }

});
