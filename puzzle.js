//Anzahl der Puzzleteile. (Je höher, desto schwieriger)
var PUZZLE_DIFFICULTY;


//Zeichenfläche
var _canvas;
var _stage;

//Verweis auf das geladene Bild
var _img;

//gesamtes Puzzle
var _puzzleWidth;
var _puzzleHeight;

//einzelne Puzzleteile
var _pieces;
var _pieceWidth;
var _pieceHeight;

// Puzzleteil, das gerade gezogen wird
var _currentPiece;

// Puzzleteil, das sich gerade in der Position befindet, auf der es abgelegt werden soll.
var _currentDropPiece;

// X- und Y-Position der Maus
var _mouse;

var _pieceClicked = false;

var _movesCount = 0;

var _wrapper = 0;

function showContainer() {
    document.getElementById("container").style.display = "block";
    document.getElementById("puzzle-container").style.display = "none";
}

function showPuzzleContainer(img, dificulty){
    document.getElementById("container").style.display = "none";
    document.getElementById("puzzle-container").style.display = "block";
    var imageSrc = img.src;
    init(imageSrc, dificulty);
}

//Bild waehlen
function random(difficulty){
    document.getElementById("container").style.display = "none";
    document.getElementById("puzzle-container").style.display = "block";
    var start = 1;
    var anzahlbilder = 4;
    var zufallszahl = Math.floor(Math.random() * (anzahlbilder - start +1 )) + start;
    var zufallsbild="image0"+zufallszahl+".png";
    init(zufallsbild, difficulty);
}

//Bild laden
function init(imgSrc, dificulty){
    //document.ontouchmove = function(event){ event.preventDefault(); }
    _img = new Image();
    _img.addEventListener('load',onImage,false);
    _img.src = imgSrc;
    PUZZLE_DIFFICULTY = dificulty;
}

//nachdem das Bild erfolgreich geladen wurde, die zuvor deklarierten Variablen festlegen.
function onImage(e){
	//die Größe des Puzzleteils berechnen ->Math.floor um gerade zahlen zu bekommen
    _pieceWidth = Math.floor(_img.width / PUZZLE_DIFFICULTY)
    _pieceHeight = Math.floor(_img.height / PUZZLE_DIFFICULTY)
    //Größe des Puzzles berechnen
    _puzzleWidth = _pieceWidth * PUZZLE_DIFFICULTY;
    _puzzleHeight = _pieceHeight * PUZZLE_DIFFICULTY;
    setCanvas();
    initPuzzle();
}

function setCanvas(){
    _wrapper = document.getElementById('puzzle-wrapper');
    var x = _puzzleWidth/2;

    //_wrapper.style.marginTop = "-300px";
    _wrapper.style.marginLeft = "-"+x+"px";
   // document.getElementById('puzzle-wrapper').style.marginTop= "-300px";
    _canvas = document.getElementById('canvas');
    _stage = _canvas.getContext('2d');
    _canvas.width = _puzzleWidth;
    _canvas.height = _puzzleHeight;
    _canvas.style.border = "3px solid white";
    _canvas.style.padding = "2px";
    //_canvas.style.marginTop = "150px";
}

function initPuzzle(){
    _pieces = [];
    _mouse = {x:0,y:0};
    _currentPiece = null;
    _currentDropPiece = null;
    //gesamtes Bild zeichnen
    _stage.drawImage(_img, 0, 0, _puzzleWidth, _puzzleHeight, 0, 0, _puzzleWidth, _puzzleHeight);
    buildPieces();
}

//was und wo soll gezeichnet werden
function buildPieces(){
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < PUZZLE_DIFFICULTY * PUZZLE_DIFFICULTY;i++){
        piece = {};
        //aktuelle Position im Puzzle, an der das Teil gezeichnet werden soll
        piece.sx = xPos;
        piece.sy = yPos;
        _pieces.push(piece);
        xPos += _pieceWidth;
        if(xPos >= _puzzleWidth){
            xPos = 0;
            yPos += _pieceHeight;
        }
    }
}

function shufflePuzzle(){
    _currentPiece = null;
	//Array mischen
    _pieces = shuffleArray(_pieces);
    //löschen alle auf dem Canvas gezeichneten Puzzlezeile
    _stage.clearRect(0,0,_puzzleWidth,_puzzleHeight);
    var i;
    var piece;
    var xPos = 0;
    var yPos = 0;
    for(i = 0;i < _pieces.length;i++){
        piece = _pieces[i];
        piece.xPos = xPos;
        piece.yPos = yPos;
        _stage.strokeStyle = "lightblue";
        _stage.lineWidth = 3;
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, xPos, yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(xPos, yPos, _pieceWidth,_pieceHeight);
        xPos += _pieceWidth;
        if(xPos >= _puzzleWidth){
            xPos = 0;
            yPos += _pieceHeight;
        }
    }

    document.onmousedown = onPuzzleClick;
}

//Array mischen
function shuffleArray(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

// festlegen auf welches Puzzleteil geklickt wurde
function onPuzzleClick(e){
    if(e.layerX || e.layerX == 0){
        _mouse.x = e.layerX - _canvas.offsetLeft;
        _mouse.y = e.layerY - _canvas.offsetTop;
    }
    else if(e.offsetX || e.offsetX == 0){
        _mouse.x = e.offsetX - _canvas.offsetLeft;
        _mouse.y = e.offsetY - _canvas.offsetTop;
    }
    if(_pieceClicked == false){
        _currentPiece = checkPieceClicked();
        _stage.save();
        _stage.globalAlpha = .9;
        _stage.strokeStyle = "#0431B4";
        _stage.lineWidth = 5;
        _stage.strokeRect(_currentPiece.xPos,_currentPiece.yPos, _pieceWidth,_pieceHeight);
        _stage.restore();
        _pieceClicked = true;
    }else{
        if(_currentPiece != null){
            _currentDropPiece = checkPieceClicked();
        var tmp = {xPos:_currentPiece.xPos,yPos:_currentPiece.yPos};
        _currentPiece.xPos = _currentDropPiece.xPos;
        _currentPiece.yPos = _currentDropPiece.yPos;
        _currentDropPiece.xPos = tmp.xPos;
        _currentDropPiece.yPos = tmp.yPos;

        _movesCount ++;
        _pieceClicked = false;

        resetPuzzleAndCheckWin();
        }else{
            _pieceClicked = false;
            onPuzzleClick(e);
        }
        
        
    }
}
//auf welches Puzzleteil wurde geklickt? -> Alle Puzzletile durchlaufen und feststellen, ob sich der Klich innerhalb der Greinzen eines unsere Onjekte befand. Wenn ja das übereinstimmende Objekt zurückgeben
function checkPieceClicked(){
    var i;
    var piece;
    for(i = 0;i < _pieces.length;i++){
        piece = _pieces[i];
        if(_mouse.x < piece.xPos || _mouse.x > (piece.xPos + _pieceWidth) || _mouse.y < piece.yPos || _mouse.y > (piece.yPos + _pieceHeight)){
            //PIECE NOT HIT
        }
        else{
            return piece;
        }
    }
    return null;
}

function resetPuzzleAndCheckWin(){
    _stage.clearRect(0,0,_puzzleWidth,_puzzleHeight);
    var gameWin = true;
    var i;
    var piece;
    for(i = 0;i < _pieces.length;i++){
        piece = _pieces[i];
        _stage.drawImage(_img, piece.sx, piece.sy, _pieceWidth, _pieceHeight, piece.xPos, piece.yPos, _pieceWidth, _pieceHeight);
        _stage.strokeRect(piece.xPos, piece.yPos, _pieceWidth,_pieceHeight);
        if(piece.xPos != piece.sx || piece.yPos != piece.sy){
            gameWin = false;
        }
    }
    if(gameWin){
        setTimeout(puzzleGameWin,500);
    }
}

function puzzleGameWin(){
    var win = 'Prima! Du hast das Puzzle mit ' + _movesCount + ' Schritten gelöst!!';
    alert(win);
}
