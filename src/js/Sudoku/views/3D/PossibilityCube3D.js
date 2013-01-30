(function () {


    Sudoku.PossibilityCube3D = function (gameBoard, assistant, threePanel) {

        var n, nSqrd, cSpace, sgSpace, cSize, gSGB, x, y, z, cell;
        n = gameBoard.getGameSize();
        nSqrd = n * n;
        cSpace = Sudoku.GameBoard3D.cellSpacing;
        sgSpace = Sudoku.GameBoard3D.subGridSpacing;
        cSize = Sudoku.GameBoard3D.cellSize;
        gSGB = gameBoard.getSubGridBoundsContainingCell.bind(gameBoard);

        THREE.Object3D.call(this);

        this._n = gameBoard.getGameSize();
        this._nSqrd = this._n * this._n;
        this._assistant = assistant;
        this._threePanel = threePanel;

        this._isHidden = true;

        this._cells = new Utils.MultiArray(this._nSqrd, this._nSqrd, this._nSqrd);

        for (var i = 0; i < this._nSqrd; i++) {
            for (var j = 0; j < this._nSqrd; j++) {
                for (var k = 0; k < this._nSqrd; k++) {
                    cell = this._cells[i][j][k] = {
                        active:null,
                        dead:new Sudoku.DeadPossibilityCubeCell3D(i, j, k),
                        live:new Sudoku.LivePossibilityCubeCell3D(i, j, k)
                    };

                    //set appropriate cell
                    if(this._assistant.possibilityIsAlive(i,j,k)){
                        if(this._assistant.possibilityIsCertainty(i,j,k)){
                            cell.live.isCertainty();
                        }
                        cell.active = cell.live;
                    } else {
                        if(this._assistant.possibilityHasErrors(i,j,k)) {
                            cell.dead.hasErrors();
                        }
                        cell.active = cell.dead;
                    }
                    this.add(cell.active);

                    x = (j * (cSize + cSpace) + gSGB(i, j).jSubGrid * sgSpace) - 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    y = -(i * (cSize + cSpace) + gSGB(i, j).iSubGrid * sgSpace) + 0.5 * ((nSqrd - 1) * (cSize + cSpace) + (n - 1) * sgSpace);
                    z = (k * (cSize + cSpace)) + Sudoku.PossibilityCube3D.zOffset;

                    cell.live.position.x = cell.dead.position.x = x;
                    cell.live.position.y = cell.dead.position.y = y;
                    cell.live.position.z = cell.dead.position.z = z;

                    this._cells[i][j][k].live.addEventListener("dblClicked", dblClicked.bind(this));
                    this._cells[i][j][k].live.addEventListener('clicked', clicked.bind(this));

                }
            }
        }

        /*assistant.addEventListener('killed', killed.bind(this));

         assistant.addEventListener('revived', revived.bind(this));

         assistant.addEventListener('isCertainty', isCertainty.bind(this));

         assistant.addEventListener('isNotCertainty', isNotCertainty.bind(this));

         assistant.addEventListener('hasErrors', hasErrors.bind(this));

         assistant.addEventListener('hasNoErrors', hasNoErrors.bind(this));*/

    };


    Sudoku.PossibilityCube3D.prototype = Object.create(THREE.Object3D.prototype);


    Sudoku.PossibilityCube3D.zOffset = Sudoku.GameBoard3D.cellSize * 3.5;


    Sudoku.PossibilityCube3D.cellSpacing = 100;


    Sudoku.PossibilityCube3D.prototype.showAll = function (length) {

        length = length || 300;

        this._threePanel.add(this);

        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.defaultMaterial,
            prop:'opacity',
            targetValue:Sudoku.LivePossibilityCubeCell3D.defaultOpacity,
            length:length
        });
        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.certaintyMaterial,
            prop:'opacity',
            targetValue:Sudoku.LivePossibilityCubeCell3D.defaultOpacity,
            length:length
        });

        this._isHidden = false;

        return this;

    }


    Sudoku.PossibilityCube3D.prototype.hideAll = function (length, callback) {

        var self = this;

        length = length || 300;

        callback = callback || function(){};

        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.defaultMaterial,
            prop:'opacity',
            targetValue:0,
            length:length
        });
        Utils.animate({
            obj:Sudoku.LivePossibilityCubeCell3D.certaintyMaterial,
            prop:'opacity',
            targetValue:0,
            length:length,
            callback:function(){
                self._isHidden = true;
                self._threePanel.remove(self);
            }
        });

        return this;

    }


    function showCell(i, j, k, length) {

        var self = this
            , cell
            ;

        length = length || 300;

        if(this._cells[i][j][k].active !== null){
            hideCell.call(
                this,
                i,
                j,
                k,
                length,
                function(){
                    showCell.call(self, i, j, k, length);
                }
            );
        } else if(this._assistant.possibilityIsAlive(i,j,k)){
            cell = this._cells[i][j][k].live;
        } else {
            cell = this._cells[i][j][k].dead;
        }

        this._cells[i][j][k].active = cell;

        this._threePanel.add(cell);
        cell.show(length);

        return this;

    }


    function hideCell(i, j, k, length, callback) {

        var self = this
            , cell = this._cells[i][j][k].active;
            ;

        length = length || 300;
        callback = callback || function () {};

        cell.hide(
            length,
            function () {
                self._threePanel.remove(cell);
                self._cells[i][j][k].active = null;
                callback();
            }
        );

        return this;

    }


    function clicked(event) {



    }


    function dblClicked(event) {



    }



})();