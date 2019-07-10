geo = {"code": "pt", "lat": 38.71307091619991, "lon": -9.129361724853538}
var room = HBInit({ roomName: "TiggerFlex 3vs3/4vs4 🔥", maxPlayers: 16, playerName : "Bot Sopa ⚽", public : true, geo});
room.setDefaultStadium("Big");
room.setScoreLimit(3);
room.setTimeLimit(4);
room.setTeamsLock(true);



// Se não há admins dá o admin para um dos jogadores restantes.
function updateAdmins() {
  // Lista todos os jogadores com exceção do host (ID = 0).
  var players = room.getPlayerList().filter((player) => player.id != 0 );
  if ( players.length == 0 ) return; // Nao há jogadores, nao faz nada.
  if ( players.find((player) => player.admin) != null ) return; // Há um admin na sala.
  room.setPlayerAdmin(players[0].id, true); // Dá admin para o primeiro não admin da sala.
}



// spam: (para evitar os spamms)
/* beautify preserve:start */
var db = { p: { N: 8, kt: 0.6 }, log: [] }; function f(a, b, c) { for (var i = 0; i < a.length; i += 1) { if (a[i][b] === c) { return i; } } return -1; } function spamFilter(player, message) { if (player.id == 0) { return; } var ind = f(db.log, 'id', player.id); db.log[ind].lm.push({ ts: Date.now() }); if (db.log[ind].lm.length >= db.p.N) { db.log[ind].lm.splice(0, db.log[ind].lm.length - db.p.N); if (db.log[ind].lm.length / ((db.log[ind].lm[db.log[ind].lm.length - 1].ts - db.log[ind].lm[0].ts) / 1000) > db.p.kt) { room.kickPlayer(player.id, "spammer detectado", false); } } }
/* beautify preserve:end */



//player
room.onPlayerJoin = function(player) {
	room.sendChat("Ganda Noob oh @" + player.name);
	console.log(player.name + " has joined.");
if (db.log.filter((p) => p.id == player.id).length == 0) { db.log.push({ id: player.id, lm: [] }); } // sistema de spam
  updateAdmins();
}




room.onPlayerChat = function (player, message) {
	if ( message == "!reizao" ) { // Senha para logar como admin.
		room.setPlayerAdmin(player.id, true); // Dá admin para o jogador que digitou a senha.
		room.sendChat(" O jogador " + player.name + " Logou como Administrador "); // Bot envia mensagem no chat de que tal jogador que digitou a senha logou como admin.
		return false; // Extremamente importante, return false faz com que a senha nao apareça no chat.
	}
	if ( message == "!limpar" && player.admin ) { // Comando para retirar os banimentos da sala.
		room.clearBans();
		room.sendChat( " NAO HA MAIS NINGUEM BANIDO " ); // Bot envia mensagem de que ninguem mais está banido.
	}
	if ( message == "!fs" && player.admin ) { // Comando para definir uma senha para a sala.
		room.setPassword("roomfs"); // "sala" é a nova senha da sala.
		room.sendChat( "Room setada para fs PW: roomfs (quando o fs acabar porfavor escrever !terminarfs)" ); // Bot envia a mensagem de que a sala foi trancada.
	}
	if (message == "!terminarfs" && player.admin ){ // Comando para retirar senha da sala.
		room.setPassword(); // como não há nada entre os parenteses a senha está em branco e isso é igual a não ter senha.
		room.sendChat(" O fs acabou "); // bot avisa que a sala agora está aberta a todos.
	}
	if (message == "!swap" && player.admin ){ 
        	if (room.getScores() == null) {
            		players = room.getPlayerList();
            		for (i = 0; i < players.length; i++){
                		if (players[i].team == 1){
                    			room.setPlayerTeam(players[i].id, 2);
               						}
                		else if (players[i].team == 2){
                   		 room.setPlayerTeam(players[i].id, 1);
                }
            }
        }
    }
	if (message == "!help" && player.admin ){ 
		room.sendChat("!𝐥𝐢𝐦𝐩𝐚𝐫(clear bans) !𝐟𝐬(jogar fs com pw na room) !𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐫𝐟𝐬(termina fs) !𝐬𝐰𝐚𝐩(trocar equipas de lado)");
	}
	message = message.split(/ +/);
    	spamFilter(player, message); 
}



//zona init

var stats = new Map(); // map where will be set all player stats
var mutedPlayers = []; // Array where will be added muted players
var init = "init"; // Smth to initialize smth
init.id = 0; // Faster than getting host's id with the method
init.name = "init";
var scorers ; // Map where will be set all scorers in the current game (undefined if reset or end)
var whoTouchedLast; // var representing the last player who touched the ball
var whoTouchedBall = [init, init]; // Array where will be set the 2 last players who touched the ball
var gk = [init, init];
var goalScored = false;









room.onGameTick = function() {
 
 
    if (kickOff == false) { // simplest comparison to not charge usulessly the tick thing
        if (room.getScores().time != 0){
            kickOff = true;
            gk = isGk();
            room.sendChat("Goleiro Vermelho: " + gk[0].name + ", Goleiro Azul: " + gk[1].name)
        }
    }
    if (goalScored == false){
        whoTouchedLast = getLastTouchTheBall(whoTouchedLast);
    }
    if (whoTouchedLast != undefined) {
 
        if (ballCarrying.get(whoTouchedLast.name)) {
            ballCarrying.get(whoTouchedLast.name)[0] += 1/60;
        }
 
        if  ( whoTouchedLast.id != whoTouchedBall[0].id){
            whoTouchedBall[1] = whoTouchedBall[0];
            whoTouchedBall[0] = whoTouchedLast; // last player who touched the ball
        }
    }
}




//configurar GK

function gkFun(player){ // !gk
 
    if (room.getScores() != null && room.getScores().time < 60){
        if (player.team == 1) {
            gk[0] = player;
        }
        else if (player.team == 2){
            gk[1] = player;
        }
    }
    return;
}




function isGk(){
    var players = room.getPlayerList();
    var min = players[0];
    min.position = {x: room.getBallPosition().x + 60}
    var max = min;
 
    for (var i = 0; i < players.length; i++) {
        if (players[i].position != null){
            if (min.position.x > players[i].position.x) min = players[i];
            if (max.position.x < players[i].position.x) max = players[i];
        }
    }
    return [min, max]
}



var kickOff = false;
var hasFinished = false;
 
room.onGameTick = function() {
 
    if (kickOff == false) { // simplest comparison to not charge usulessly the tick thing
        if (room.getScores().time != 0){
            kickOff = true;
            gk = isGk();
            room.sendChat("GK 🔴: " + gk[0].name + "/ GK 🔵: " + gk[1].name)
        }
    }
}


room.onTeamVictory = function(scores) {
if(scores.red>scores.blue)
room.sendChat("A equipa 🔴 ganhou!")
else
room.sendChat("A equipa 🔵 ganhou!")
}


room.onPlayerLeave = function(player) {
	console.log(player.name + " has left.");
  updateAdmins();
}

room.onGameStop = function(){
    scorers = undefined;
    whoTouchedBall = [init, init];
    whoTouchedLast = undefined;
    gk = [init, init];
    kickOff = false;
    hasFinished = false;
}
