class Card {
    constructor(name, attack, defense, hp, ability) {
        this.name = name;
        this.attack = attack;
        this.defense = defense;
        this.hp = hp;
        this.ability = ability;  // 特殊能力（例: クラッキング、金、範囲攻撃、ダブルスラッシュ）
    }

    useAbility(targets, user) {
        let log = '';
        if (this.ability === 'ライフスティール') {
            const stealAmount = Math.min(this.attack, targets[0].hp);
            targets[0].hp -= stealAmount;
            user.hp += stealAmount;
            log = `${user.name}はライフスティールを使い、${stealAmount}HPを回復した！`;
        } else if (this.ability === '金') {
            targets[0].defense += 3;
            log = `${user.name}は金のカードを使い、防御が3上がった！ (防御: ${targets[0].defense})`;
        } else if (this.ability === 'クラッキング') {
            targets[0].isCracked = true;
            log = `${user.name}はクラッキングを使い、${targets[0].name}にエフェクトを与えた！次のダメージが増加する。`;
        } else if (this.ability === '範囲攻撃') {
            log = `${user.name}は範囲攻撃を行った！`;
            targets.forEach(target => {
                let damage = this.attack - target.defense;
                damage = damage > 0 ? damage : 0;
                target.hp -= damage;
                log += ` ${target.name}に${damage}ダメージ！ (HP: ${target.hp})`;
            });
        } else if (this.ability === 'ダブルスラッシュ') {
            let damage = this.attack - targets[0].defense;
            damage = damage > 0 ? damage : 0;
            log = `${user.name}はダブルスラッシュを使い、${targets[0].name}に${damage}ダメージを2回与えた！`;
            targets[0].hp -= damage * 2;
        } else if (this.ability === 'ランダムスラッシュ') {
            let damage = this.attack - (targets[0].defense  / 1.6);
            targets[0].isCracked = true;
            damage = damage > 0 ? damage : 0;
            log = `${user.name}はランダムスラッシュを使い、${targets[0].name}に${damage}ダメージをランダム回与えた！`;
            targets[0].hp -= damage * Math.random() * 5.25 / ( targets[0].defense / 15);
        }
        return log;
    }
}

class Player {
    constructor(name, isCPU = false) {
        this.name = name;
        this.hp = 100;
        this.defense = 5;
        this.deck = [];
        this.isCracked = false;
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

    playCard(opponents) {
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            let log = '';
            if (card.ability === '範囲攻撃') {
                log = card.useAbility(opponents, this);
            } else {
                let opponent = opponents[0];  // ターゲットは最初の1人
                let damage = card.attack - opponent.defense;

                if (opponent.isCracked) {
                    damage *= 1.5;
                    opponent.isCracked = false;
                }

                damage = damage > 0 ? damage : 0;
                opponent.hp -= damage;
                log = `${this.name}の${card.name}が${opponent.name}に${damage}ダメージを与えた！ (HP: ${opponent.hp})`;

                // 特殊能力の発動
                if (card.ability) {
                    log += '\n' + card.useAbility([opponent], this);
                }
            }

            return log;
        }
        return `${this.name}はカードを持っていない！`;
    }
}

// デッキの初期化とカードリスト
const deckStack = [];

const cardList = [
    new Card("戦士", 10, 5, 1, null),
    new Card("ランダムスラッシュ", 2, 0, 1, null),
    new Card("魔法使い", 8, 3, 15, 'ライフスティール'),
    new Card("商人", 7, 4, 18, '金'),
    new Card("クラッカー", 6, 2, 12, 'クラッキング'),
    new Card("範囲攻撃", 9, 0, 0, '範囲攻撃'),
    new Card("ダブルスラッシュ", 5, 0, 0, 'ダブルスラッシュ'),
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
    const opponents = players.filter((p, idx) => idx !== currentTurn % players.length);

    if (currentPlayer.isCPU) {
        logToGame(currentPlayer.drawCard(deckStack));
        logToGame(currentPlayer.playCard(opponents));
    } else {
        logToGame(currentPlayer.drawCard(deckStack));
        logToGame(currentPlayer.playCard(opponents));
    }

    currentTurn++;

    // 山札が空になった場合の勝者判定
    if (deckStack.length === 0) {
        let winner = players.reduce((prev, curr) => (prev.hp > curr.hp ? prev : curr));
        logToGame(`ゲーム終了！勝者は${winner.name}です！ (HP: ${winner.hp})`);
        document.getElementById('next-turn').disabled = true; // ボタンを無効化
    }
}

document.getElementById('next-turn').addEventListener('click', nextTurn);
