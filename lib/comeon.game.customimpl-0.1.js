(function ($) {

    'use strict';

    $(document).ready(function() {

        //login
        $('#login form').on('submit', function() {

            var username = $('#login form [name=username]').val();
            var password = $('#login form [name=password]').val();

            login(username, password, function(response) {
                if('success' == response.status) {
                    var player = response.player;

                    sessionStorage.setItem("username", username);
                    sessionStorage.setItem("player", JSON.stringify(player));

                    initCasinoView(username, player);
                }
                else {
                    alert(response.error);
                }
            });

            return false;
        });

        //logout
        $('.button.logout').on('click', function() {
            var username = sessionStorage.getItem("username");

            logout(username, function(response) {
                if('success' == response.status) {
                    $('#login form').trigger("reset");
                    $('.view').hide();
                    $('#login').show();
                }
            });

        });


        $('.search.input input').on('keyup', function() {
            var value = $(this).val().toLowerCase();
            $(".game.item").not('.game.item.template').filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
            });
        });


        $('.button.backtocasino').on('click', function() {
            $('.view').hide();
            $('#casino').show();
            $('#game-launch').empty();
        });

        //check user has already logged in
        var username = sessionStorage.getItem("username");
        var player = JSON.parse(sessionStorage.getItem("player"));
        if(username != null && player != null) {
            initCasinoView(username, player);
        }

    });
    /*
        var fail2 = function(response) {
            console.log(response);
        }
    */


    var login = function (username, password, callback) {
            $.ajax({
                url: '/login',
                type : 'POST',
                data: {
                    username: username,
                    password: password
                },
                success: callback
            });
        },
        logout = function (username, callback) {
            $.ajax({
                url: '/logout',
                type : 'POST',
                data: {
                    username: username
                },
                success: callback
            });
        },
        getGames = function(callback) {
            $.ajax({
                url: '/games',
                type : 'GET',
                success: callback
            });
        },
        getCategories = function(callback) {
            $.ajax({
                url: '/categories',
                type : 'GET',
                success: callback
            });
        },
        initCasinoView = function(username, player) {
            $('.view').hide();


            $('.player.item .ui.avatar.image')
                .attr('src', player.avatar);
            $('.player.item .content .header .name')
                .html(player.name);
            $('.player.item .content .description')
                .html(player.event);

            $('#casino').show();


            getGames(function(games) {

                var gameItemTemplate = $('.game.item.template');

                for(var gameIndex in games) {
                    var game = games[gameIndex];
                    var gameItem = gameItemTemplate.clone();
                    gameItem.removeClass('template');
                    gameItemTemplate.parent().append(gameItem);

                    gameItem.find('.ui.small.image img')
                        .attr('src', game.icon);
                    gameItem.find('.content .header .name')
                        .html(game.name);
                    gameItem.find('.content .description')
                        .html(game.description);


                    for (var categoryIdIndex in game.categoryIds) {
                        var categoryid = game.categoryIds[categoryIdIndex];
                        gameItem.append('<input type="hidden" class="categoryid" value="'+ categoryid +'">')
                    }

                    var playButton = gameItem.find('.content .extra .button.play');
                    playButton.attr('gamecode', game.code);
                    playButton.click(function() {
                        $('.view').hide();
                        $('#ingame').show();
                        comeon.game.launch($(this).attr('gamecode'));
                    });

                    gameItem.show();
                }
            });


            getCategories(function(categories) {

                var categoryItemTemplate = $('.category.item.template');

                for(var categoryIndex in categories) {
                    var category = categories[categoryIndex];
                    var categoryItem = categoryItemTemplate.clone();
                    categoryItem.removeClass('template');
                    categoryItemTemplate.parent().append(categoryItem);

                    categoryItem.find('.content .header')
                        .html(category.name);
                    categoryItem.attr('categoryid', category.id);
                    categoryItem.click(function() {
                        var gameItems = $(".game.item");
                        var categoryid = $(this).attr('categoryid');
                        gameItems.hide();
                        gameItems.find('.categoryid[value='+ categoryid +']').parent().show();
                    });

                    categoryItem.show();
                }
            });

        };

})(jQuery);
