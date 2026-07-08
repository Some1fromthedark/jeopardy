let game;

const board = document.getElementById("board");
let currentTile = null;
let currentQuestionValue = 0;
let stagedScores = [];
let usedQuestions = new Set();

fetch("game.json?v=" + Date.now())
    .then(r => r.json())
    .then(data => {

        game = data;

        loadGameState();

        buildHeader();
        buildBoard();
        buildScoreboard();

    });
	
function saveGameState(){

    const state = {

        scores: game.teams.map(team => team.score),

        usedQuestions: Array.from(usedQuestions)

    };

    localStorage.setItem(
        "weddingJeopardyState",
        JSON.stringify(state)
    );

}


function loadGameState(){

    const saved =
        localStorage.getItem("weddingJeopardyState");

    if(!saved)
        return;

    const state = JSON.parse(saved);


    if(state.scores){

        game.teams.forEach((team,index)=>{

            if(state.scores[index] !== undefined){

                team.score = state.scores[index];

            }

        });

    }


    if(state.usedQuestions){

        usedQuestions =
            new Set(state.usedQuestions);

    }

}

function buildHeader(){

    document.getElementById("gameTitle").textContent =
        game.title;

    document.getElementById("gameSubtitle").textContent =
        game.subtitle;

}

function buildBoard(){

    board.innerHTML = "";

	board.style.gridTemplateColumns =
		`repeat(${game.categories.length}, minmax(0,1fr))`;

    game.categories.forEach(category=>{

        const column=document.createElement("div");

        column.className="category-column";

        const header=document.createElement("div");

        header.className="category";

        header.textContent=category.title;

        column.appendChild(header);

        category.questions.forEach((question,row)=>{

            const tile=document.createElement("div");

            tile.className="tile";
			
			const questionId =
				`${game.categories.indexOf(category)}-${row}`;

			tile.dataset.questionId = questionId;

            tile.textContent="$"+game.questionValues[row];

            tile.onclick=()=>showQuestion(
                tile,
                category.title,
                row,
                question
            );
			
			if(usedQuestions.has(questionId)){

				tile.classList.add("used");

			}

            column.appendChild(tile);

        });

        board.appendChild(column);

    });

}

function buildScoreboard(){

    const scoreboard=document.getElementById("scoreboard");

    scoreboard.innerHTML="";

    game.teams.forEach((team,index)=>{

        const card=document.createElement("div");

        card.className="team";

        card.innerHTML=`

            <div class="team-name">
                ${team.name}
            </div>

            <div
                class="team-score"
                id="team${index}Score">
                ${team.score}
            </div>

            <div class="score-controls">

                <button class="adjustButton">
                    -100
                </button>
				
				<button class="adjustButton">
				    0
				</button>

                <button class="adjustButton">
                    +100
                </button>

            </div>

        `;

        const buttons =
            card.querySelectorAll(".adjustButton");

        buttons[0].onclick = () => {
            updateScore(index,-100);
        };

		buttons[1].onclick = () => {
			updateScore(index,-game.teams[index].score);
		};

        buttons[2].onclick = () => {
            updateScore(index,100);
        };

        scoreboard.appendChild(card);

    });

}

function updateScore(teamIndex,amount){

    game.teams[teamIndex].score += amount;

    document.getElementById(
        `team${teamIndex}Score`
    ).textContent =
        game.teams[teamIndex].score;

    saveGameState();

}

function showQuestion(tile, category, row, question){

    if(tile.classList.contains("used"))
        return;

    currentTile = tile;
    currentQuestionValue = game.questionValues[row];
	stagedScores = game.teams.map(() => 0);

    document.getElementById("questionModal")
        .classList.remove("hidden");

    document.getElementById("questionValue").textContent =
        "$" + currentQuestionValue;

    document.getElementById("questionCategory").textContent =
        category;

    document.getElementById("questionText").textContent =
        question.question;

    document.getElementById("answer").textContent =
        question.answer;

    document.getElementById("answer")
        .classList.add("hidden");

    document.getElementById("scoringPanel")
        .classList.remove("hidden");

    document.getElementById("revealButton")
        .style.display = "inline-block";
		
	document.getElementById("backButton")
		.classList.remove("hidden")
	
	updateStagedDisplay();
	buildAwardButtons();

}

document.getElementById("backButton").onclick = skipQuestion;

document.getElementById("revealButton").onclick = () => {

    document.getElementById("answer")
        .classList.remove("hidden");
		
	document.getElementById("finishButton")
		.classList.remove("hidden")

	document.getElementById("backButton")
		.classList.add("hidden")

    document.getElementById("revealButton")
        .style.display = "none";

};

document.getElementById("finishButton").onclick = () => {
    stagedScores.forEach((amount,index)=>{

		document.getElementById("finishButton")
			.classList.add("hidden")

        updateScore(index,amount);

    });
	
	stagedScores = game.teams.map(() => 0);
	
	finishQuestion();
};

function buildAwardButtons(){

    const awardContainer =
        document.getElementById("awardButtons");

    const deductContainer =
        document.getElementById("deductButtons");

    awardContainer.innerHTML = "";
    deductContainer.innerHTML = "";

    game.teams.forEach((team,index)=>{

        const awardButton=document.createElement("button");

        awardButton.className="teamButton";

        awardButton.textContent=team.name;

        awardButton.onclick=()=>{

            stagedScores[index] += currentQuestionValue;

            updateStagedDisplay();

        };

        awardContainer.appendChild(awardButton);



        const deductButton=document.createElement("button");

        deductButton.className="teamButton";

        deductButton.textContent=team.name;

        deductButton.onclick=()=>{

            stagedScores[index] -= currentQuestionValue;

            updateStagedDisplay();

        };

        deductContainer.appendChild(deductButton);

    });

}

function updateStagedDisplay(){

    const container =
        document.getElementById("stagedScores");

    container.innerHTML = "";

    game.teams.forEach((team,index)=>{

        const preview =
            stagedScores[index];

        const row=document.createElement("div");

        row.className="stagedScoreRow";


        const name=document.createElement("span");

        name.className="stagedTeamName";

        name.textContent=team.name;


        const score=document.createElement("span");

        score.className="stagedTeamScore";

        score.textContent=team.score;


        const change=document.createElement("span");

        change.className="stagedChange";


        if(preview > 0){

            change.textContent =
                ` +${preview}`;

            change.classList.add("positive");

        }
        else if(preview < 0){

            change.textContent =
                ` ${preview}`;

            change.classList.add("negative");

        }
        else{

            change.textContent =
                "";

        }


        row.appendChild(name);
        row.appendChild(score);
        row.appendChild(change);

        container.appendChild(row);

    });


    // Optional pending changes indicator
    const panel =
        document.getElementById("stagedScorePanel");

    if(stagedScores.some(score => score !== 0)){

        panel.classList.add("hasChanges");

    }
    else{

        panel.classList.remove("hasChanges");

    }

}

function finishQuestion(){

    document.getElementById("questionModal")
        .classList.add("hidden");


    if(currentTile){

        currentTile.classList.add("used");

        usedQuestions.add(
            currentTile.dataset.questionId
        );

    }


    document.getElementById("scoringPanel")
        .classList.add("hidden");


    document.getElementById("answer")
        .classList.add("hidden");


    saveGameState();

}

function skipQuestion(){
	
	document.getElementById("questionModal")
        .classList.add("hidden");
	
	document.getElementById("awardPanel")
        .classList.add("hidden");

    document.getElementById("answer")
        .classList.add("hidden");
	
}

document.getElementById("resetGame").onclick = () => {

    if(confirm("Reset all scores?")){

        localStorage.removeItem(
            "weddingJeopardyState"
        );

        location.reload();

    }

};
