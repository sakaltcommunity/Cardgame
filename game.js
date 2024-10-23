class Card {
    constructor(name, attack, defense, hp, ability) {
        this.name = name;
        this.attack = attack;
        this.defense = defense;
        this.hp = hp;
        this.ability = ability;  // 特殊能力（例: クラッキング、金）
    }

    useAbility(target, user) {
        if (this.ability === 'ライフスティール') {
            const stealAmount = Math.min(this.attack, target.hp);
            target.hp -= stealAmount;
            user.hp += stealAmount;
            return `${user.name}はライフスティールを使い、${stealAmount}HPを回復した！`;
        } else if (this.ability === '金') {
            target.defense += 3;  // 防御を3アップ
            return `${user.name}は金のカードを使い、防御が3上がった！ (防御: ${target.defense})`;
        } else if (this.ability === 'クラッキング') {
            target.isCracked = true;  // クラッキング状態にする
            return `${user.name}はクラッキングを使い、${target.name}にエフェクトを与えた！次のダメージが増加する。`;
        }
        return '';
    }
}

class Player {
    constructor(name, isCPU = false) {
        this.name = name;
        this.hp = 100;
        this.defense = 5;
        this.deck = [];
        this.isCracked = false;  // クラッキングされたかどうか
        this.isCPU = isCPU;  
    }

    drawCard(deckStack) {
        if (deckStack.length > 0) {
            const card = deckStack.pop();
            this.deck.push(card);
            return `${this.name}がカードを引いた: ${card.name}`;
        }
        return "山札がなくなった";
    }

    playCard(opponent) {
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            let damage = card.attack - opponent.defense;
            
            if (opponent.isCracked) {
                damage *= 1.5;  // クラッキングの影響でダメージが1.5倍
                opponent.isCracked = false;  // クラッキング状態を解除
            }

            damage = damage > 0 ? damage : 0;
            opponent.hp -= damage;
            let log = `${this.name}の${card.name}が${opponent.name}に${damage}ダメージを与えた！ (HP: ${opponent.hp})`;

            // 特殊能力の発動
            if (card.ability) {
                log += '\n' + card.useAbility(opponent, this);
            }

            return log;
        }
        return `${this.name}はカードを持っていない！`;
    }
}

// デッキの初期化とカードリスト
const deckStack = [];

const cardList = [
    new Card("戦士", 10, 5, 20, null),
    new Card("魔法使い", 8, 3, 15, 'ライフスティール'),
    new Card("商人", 7, 4, 18, '金'),
    new Card("クラッカー", 6, 2, 12, 'クラッキング'),
];

// 山札に60枚のカードを追加
for (let i = 0; i < 60; i++) {
    const randomCard = cardList[Math.floor(Math.random() * cardList.length)];
    deckStack.push(randomCard);
}

const player = new Player("プレイヤー");
const cpu1 = new Player("CPU 1", true);
const cpu2 = new Player("CPU 2", true);

const players = [player, cpu1, cpu2];
let currentTurn = 0;

function logToGame(message) {
    const logDiv = document.getElementById('game-log');
    const newLog = document.createElement('p');
    newLog.textContent = message;
    logDiv.appendChild(newLog);
}

function nextTurn() {
    const currentPlayer = players[currentTurn % players.length];
    const opponent = players[(currentTurn + 1) % players.length];
    
    if (currentPlayer.isCPU) {
        logToGame(currentPlayer.drawCard(deckStack));
        logToGame(currentPlayer.playCard(opponent));
    } else {
        logToGame(currentPlayer.drawCard(deckStack));
        logToGame(currentPlayer.playCard(opponent));
    }

    currentTurn++;
}

document.getElementById('next-turn').addEventListener('click', nextTurn);
