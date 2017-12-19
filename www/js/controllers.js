angular.module('starter.controllers', [])

        .controller('DashCtrl', function ($scope, $timeout, $http) {

            var watchID;
            $scope.count = 0;
            $scope.list_coord = [];
            $scope.cod = {codigo: 2};
            var db = null;
            $scope.enable = true;


            function openSqLite() {
                db = window.sqlitePlugin.openDatabase({name: "mylocations.db", androidDatabaseImplementation: 2});
                db.transaction(function (tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS latlong (lat, long, data, cod)');
                }, function (error) {
                    console.log('Transaction ERROR: ' + error.message);
                });
            }

            function insertCoordenadas(lat, long, timestamp, codigo) {
                openSqLite();
                db.transaction(function (tx) {
                    tx.executeSql('INSERT INTO latlong VALUES (?,?,?,?)', [lat, long, timestamp, codigo]);
                    //$scope.consultaCoordenadas(codigo, false);
                }, function (error) {
                    console.log('Transaction ERROR: ' + error.message);
                });
            }

            $scope.enviarDados = function (codigo) {
                var dados = [];
                openSqLite();
                var sql = 'Select * FROM latlong';
                if (codigo != 0) {
                    sql += " Where cod = " + codigo + "";
                }

                db.executeSql(sql, [], function (rs) {
                    for (var i = 0; i < rs.rows.length; i++) {
                        dados.push({lat: rs.rows.item(i).lat, long: rs.rows.item(i).long, data: rs.rows.item(i).data, cod: rs.rows.item(i).cod});
                    }

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                        }
                    }


                    var url = "http://mydomain.com.br/webService/save";

                    var paramSerializado = dados;
                    $http({
                        method: 'POST',
                        url: url,
                        data: paramSerializado,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function (result) {
                        alert("Enviou");
                    });
                }, function (error) {
                    alert('SELECT SQL statement ERROR: ' + error.message);
                });
            }

            $scope.apagarDados = function (codigo) {
                var sql = 'DELETE FROM latlong';
                if (codigo != 0) {
                    sql += " Where cod = " + codigo + "";
                }
                db.executeSql(sql, [], function (rs) {
                    $timeout(function () {
                        $scope.list_coord = [];
                        alert('apagou');
                        $scope.consultaCoordenadas(codigo, true);
                    }, 500);
                }, function (error) {
                    alert('SELECT SQL statement ERROR: ' + error.message);
                });
            }

            $scope.consultaCoordenadas = function (codigo, message) {
                openSqLite();
                $scope.list_coord = [];

                var sql = 'Select * FROM latlong';
                if (codigo != 0) {
                    sql += " Where cod = " + codigo + "";
                }

                db.executeSql(sql, [], function (rs) {
                    $timeout(function () {
                        for (var i = 0; i < rs.rows.length; i++) {
                            $scope.list_coord.push({lat: rs.rows.item(i).lat, long: rs.rows.item(i).long, data: rs.rows.item(i).data, cod: rs.rows.item(i).cod});
                        }
                        if (message) {
                            alert("Finalizou");
                        }
                    }, 500);
                }, function (error) {
                    alert('SELECT SQL statement ERROR: ' + error.message);
                });
            }



            var geolocationOption = {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true};

            document.addEventListener("deviceready", onDeviceReady, false);
            function onDeviceReady() {
                console.log("navigator.geolocation works well");
            }

            function onSuccess(position) {
                console.log(position);
                $scope.count++;
                $timeout(function () {
                    insertCoordenadas(position.coords.latitude, position.coords.longitude, position.timestamp, parseInt($scope.cod.codigo));
                }, 500);
            }

            function onError(error) {
                console.log('code: ' + error.code + '\n' +
                        'message: ' + error.message + '\n');
            }

            navigator.geolocation.getCurrentPosition(onSuccess, onError);


            $scope.iniciarMonitoramento = function () {
                $scope.enable = false;
                watchID = navigator.geolocation.watchPosition(onSuccess, onError, geolocationOption);
            }


            $scope.pararMonitoramento = function () {
                navigator.geolocation.clearWatch(watchID);
                $scope.enable = true;
                $scope.count = 0;
            }

        });



