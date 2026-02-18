# キャラクター日常サイクルシステム - リサーチレポート

**作成日**: 2025-10-23
**調査対象**: 他ゲームのキャラクター動作パターン（出勤・働く・退勤）の実装方法

---

## エグゼクティブサマリー

カイロソフトスタイルのキャラクター日常サイクル（出勤→働く→退勤）は、**行動ツリー(Behavior Tree)**と**ステートマシン(State Machine)**を組み合わせることで実装可能です。

### 実装可能性: ✅ **高い（JavaScript/Canvasで十分実現可能）**

---

## 調査結果

### 1. カイロソフトゲームの特徴

#### ゲーム例
- Game Dev Story（ゲーム発展国）
- Hot Springs Story（温泉物語）
- Anime Studio Story（アニメスタジオ物語）

#### 観察されたキャラクター動作
1. **出勤**
   - キャラクターが画面外（または入口）から登場
   - 自分のデスクに向かって移動

2. **働く**
   - デスクで作業アニメーション（タイピング、書類処理）
   - ランダムに施設を利用（休憩所、会議室）
   - プロジェクト中は特定エリアに集まる

3. **退勤**
   - 時間になると出口に向かって移動
   - 画面外に消える

#### 技術スタック
- **開発エンジン**: Unity（カイロソフト公式発表）
- **グラフィック**: ドット絵ピクセルアート（16x16 or 32x32）
- **視点**: クォータービュー（斜め上から見た2.5D風）

---

## 2. 業界標準の実装手法

### 2.1 行動ツリー (Behavior Tree)

#### 概要
NPCの意思決定を木構造で表現する手法。2025年現在、ゲームAIの業界標準。

#### 主な採用例
- **Halo**: 敵AI戦闘行動
- **The Last of Us**: コンパニオンAI
- **多数のシミュレーションゲーム**: 市民/労働者NPC

#### 構造例（従業員の1日）

```
Root (Selector)
├─ 出勤フェーズ (Sequence)
│  ├─ 時刻チェック: 9:00～9:30か？
│  ├─ 入口に移動
│  └─ デスクに移動
├─ 勤務フェーズ (Selector)
│  ├─ プロジェクト作業 (Sequence)
│  │  ├─ プロジェクト割当あるか？
│  │  ├─ プロジェクトエリアに移動
│  │  └─ 作業アニメーション実行
│  ├─ 休憩 (Sequence)
│  │  ├─ 疲労度チェック: 70%以上か？
│  │  ├─ 休憩室に移動
│  │  └─ 休憩アニメーション実行
│  └─ デスク作業 (Default)
│     ├─ デスクに移動
│     └─ タイピングアニメーション
└─ 退勤フェーズ (Sequence)
   ├─ 時刻チェック: 18:00以降か？
   ├─ 出口に移動
   └─ フェードアウト
```

#### メリット
- ✅ 視覚的に理解しやすい
- ✅ モジュール化が容易
- ✅ デバッグしやすい
- ✅ 複雑な行動パターンに対応

#### デメリット
- ⚠️ 初期設計に時間がかかる
- ⚠️ JavaScript実装には専用ライブラリが必要（または自作）

---

### 2.2 ステートマシン (State Machine)

#### 概要
キャラクターの状態を明確に定義し、状態間の遷移を管理する手法。

#### 状態例（従業員の1日）

```javascript
const EmployeeStates = {
    COMMUTING_IN: {
        enter: () => moveToEntrance(),
        update: (dt) => updateMovement(),
        exit: () => arrivedAtDesk()
    },
    IDLE_AT_DESK: {
        enter: () => playIdleAnimation(),
        update: (dt) => {
            if (hasTask()) transition('WORKING');
            if (isTired()) transition('RESTING');
            if (isEndOfDay()) transition('COMMUTING_OUT');
        },
        exit: () => stopIdleAnimation()
    },
    WORKING: {
        enter: () => moveToWorkArea(),
        update: (dt) => {
            progressWork(dt);
            if (taskComplete()) transition('IDLE_AT_DESK');
        },
        exit: () => completeTask()
    },
    RESTING: {
        enter: () => moveToBreakRoom(),
        update: (dt) => {
            recoverEnergy(dt);
            if (energyFull()) transition('IDLE_AT_DESK');
        },
        exit: () => leaveBreakRoom()
    },
    COMMUTING_OUT: {
        enter: () => moveToExit(),
        update: (dt) => updateMovement(),
        exit: () => employeeLeft()
    }
};
```

#### メリット
- ✅ シンプルで実装が容易
- ✅ JavaScript標準機能だけで実装可能
- ✅ デバッグが簡単
- ✅ 軽量で高速

#### デメリット
- ⚠️ 複雑な行動では状態爆発が起きる
- ⚠️ 階層的な行動表現が難しい

---

### 2.3 アイドルアニメーション

#### 自然な待機動作の実装パターン

リサーチから得られた知見：

> "A common structure for an idle animation loop is to have a **primary looped behavior** which may be broken up by **intermittent behaviors**."

#### 実装例

```javascript
class EmployeeIdleAnimation {
    constructor(employee) {
        this.employee = employee;
        this.primaryLoopDuration = 5000; // 5秒
        this.intermittentChance = 0.2; // 20%の確率
        this.lastIntermittent = 0;
    }

    update(deltaTime) {
        // プライマリループ: 呼吸、小さな動き
        this.playBreathingAnimation();

        // ランダムにインターミットな動作
        if (Math.random() < this.intermittentChance &&
            Date.now() - this.lastIntermittent > 10000) {
            this.playIntermittentBehavior();
            this.lastIntermittent = Date.now();
        }
    }

    playIntermittentBehavior() {
        const behaviors = [
            'stretch',      // 伸びをする
            'yawn',         // あくびをする
            'look_around',  // キョロキョロする
            'adjust_hair',  // 髪を直す
            'check_phone'   // スマホを見る
        ];

        const random = behaviors[Math.floor(Math.random() * behaviors.length)];
        this.employee.playAnimation(random);
    }
}
```

---

## 3. 推奨実装アーキテクチャ

### ハイブリッドアプローチ: ステートマシン + スケジュール管理

```javascript
// ============================================
// 1. 時間管理システム
// ============================================
class GameClock {
    constructor() {
        this.currentTime = 9 * 60; // 9:00 (分単位)
        this.timeSpeed = 1; // 1分 = 1秒
        this.dayLength = 10 * 60; // 9:00～19:00の10時間
    }

    update(deltaTime) {
        this.currentTime += (deltaTime / 1000) * this.timeSpeed;

        // 1日終了
        if (this.currentTime >= 19 * 60) {
            this.currentTime = 9 * 60;
            this.onDayEnd();
        }
    }

    getCurrentHour() {
        return Math.floor(this.currentTime / 60);
    }

    getCurrentMinute() {
        return Math.floor(this.currentTime % 60);
    }

    getFormattedTime() {
        const h = this.getCurrentHour();
        const m = this.getCurrentMinute();
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
}


// ============================================
// 2. 従業員スケジュール
// ============================================
class EmployeeSchedule {
    constructor(employee) {
        this.employee = employee;
        this.schedule = [
            { time: '09:00', action: 'arrive', priority: 10 },
            { time: '09:15', action: 'start_work', priority: 8 },
            { time: '12:00', action: 'lunch_break', priority: 9 },
            { time: '13:00', action: 'resume_work', priority: 8 },
            { time: '15:00', action: 'afternoon_break', priority: 5, chance: 0.6 },
            { time: '18:00', action: 'end_work', priority: 10 },
            { time: '18:30', action: 'leave', priority: 10 }
        ];
    }

    getNextAction(currentTime) {
        const now = this.parseTime(currentTime);

        for (let schedule of this.schedule) {
            const scheduleTime = this.parseTime(schedule.time);

            if (scheduleTime <= now && !schedule.completed) {
                // 確率チェック（オプショナルな行動）
                if (schedule.chance && Math.random() > schedule.chance) {
                    schedule.completed = true;
                    continue;
                }

                return schedule;
            }
        }

        return null;
    }

    parseTime(timeString) {
        const [h, m] = timeString.split(':').map(Number);
        return h * 60 + m;
    }

    resetDay() {
        this.schedule.forEach(s => s.completed = false);
    }
}


// ============================================
// 3. 従業員ステートマシン
// ============================================
class EmployeeStateMachine {
    constructor(employee, schedule, officeLayout) {
        this.employee = employee;
        this.schedule = schedule;
        this.layout = officeLayout;
        this.currentState = 'OFF_DUTY';
        this.states = this.defineStates();
    }

    defineStates() {
        return {
            OFF_DUTY: {
                enter: () => {
                    this.employee.visible = false;
                },
                update: (deltaTime, clock) => {
                    const nextAction = this.schedule.getNextAction(clock.getFormattedTime());
                    if (nextAction && nextAction.action === 'arrive') {
                        this.transition('ARRIVING');
                    }
                }
            },

            ARRIVING: {
                enter: () => {
                    this.employee.visible = true;
                    this.employee.position = this.layout.entrance;
                    this.employee.targetPosition = this.layout.getDesk(this.employee.department);
                    this.employee.playAnimation('walk');
                },
                update: (deltaTime) => {
                    this.employee.moveTowardsTarget(deltaTime);
                    if (this.employee.hasReachedTarget()) {
                        this.transition('IDLE_AT_DESK');
                    }
                }
            },

            IDLE_AT_DESK: {
                enter: () => {
                    this.employee.playAnimation('idle');
                },
                update: (deltaTime, clock) => {
                    const nextAction = this.schedule.getNextAction(clock.getFormattedTime());

                    if (!nextAction) {
                        // ランダムなアイドル動作
                        if (Math.random() < 0.01) { // 1%/フレーム
                            this.playRandomIdleBehavior();
                        }
                        return;
                    }

                    switch(nextAction.action) {
                        case 'start_work':
                        case 'resume_work':
                            this.transition('WORKING');
                            break;
                        case 'lunch_break':
                        case 'afternoon_break':
                            this.transition('RESTING');
                            break;
                        case 'end_work':
                            this.transition('LEAVING');
                            break;
                    }
                }
            },

            WORKING: {
                enter: () => {
                    // プロジェクトがある場合はプロジェクトエリアへ
                    if (this.employee.currentProject) {
                        this.employee.targetPosition = this.layout.getProjectArea(this.employee.currentProject);
                        this.employee.playAnimation('walk');
                    } else {
                        this.employee.playAnimation('typing');
                    }
                },
                update: (deltaTime, clock) => {
                    // 移動中の場合
                    if (this.employee.isMoving) {
                        this.employee.moveTowardsTarget(deltaTime);
                        if (this.employee.hasReachedTarget()) {
                            this.employee.playAnimation('typing');
                        }
                        return;
                    }

                    // 作業中のアニメーション
                    this.employee.work(deltaTime);

                    // 次のスケジュールチェック
                    const nextAction = this.schedule.getNextAction(clock.getFormattedTime());
                    if (nextAction && nextAction.action === 'lunch_break') {
                        this.transition('RESTING');
                    } else if (nextAction && nextAction.action === 'end_work') {
                        this.transition('IDLE_AT_DESK');
                    }
                }
            },

            RESTING: {
                enter: () => {
                    this.employee.targetPosition = this.layout.breakRoom;
                    this.employee.playAnimation('walk');
                },
                update: (deltaTime, clock) => {
                    // 移動中
                    if (this.employee.isMoving) {
                        this.employee.moveTowardsTarget(deltaTime);
                        if (this.employee.hasReachedTarget()) {
                            this.employee.playAnimation('resting');
                        }
                        return;
                    }

                    // 休憩
                    this.employee.recover(deltaTime);

                    // 休憩終了
                    const nextAction = this.schedule.getNextAction(clock.getFormattedTime());
                    if (nextAction && nextAction.action === 'resume_work') {
                        // デスクに戻る
                        this.employee.targetPosition = this.layout.getDesk(this.employee.department);
                        this.employee.playAnimation('walk');
                        this.employee.isMoving = true;
                        this.transition('IDLE_AT_DESK');
                    }
                }
            },

            LEAVING: {
                enter: () => {
                    this.employee.targetPosition = this.layout.exit;
                    this.employee.playAnimation('walk');
                },
                update: (deltaTime) => {
                    this.employee.moveTowardsTarget(deltaTime);
                    if (this.employee.hasReachedTarget()) {
                        this.transition('OFF_DUTY');
                    }
                }
            }
        };
    }

    transition(newState) {
        if (this.states[this.currentState].exit) {
            this.states[this.currentState].exit();
        }

        console.log(`${this.employee.name}: ${this.currentState} → ${newState}`);
        this.currentState = newState;

        if (this.states[this.currentState].enter) {
            this.states[this.currentState].enter();
        }
    }

    update(deltaTime, clock) {
        if (this.states[this.currentState].update) {
            this.states[this.currentState].update(deltaTime, clock);
        }
    }

    playRandomIdleBehavior() {
        const behaviors = ['stretch', 'yawn', 'look_around', 'adjust_hair'];
        const random = behaviors[Math.floor(Math.random() * behaviors.length)];
        this.employee.playAnimation(random);
    }
}


// ============================================
// 4. オフィスマネージャー（統合）
// ============================================
class OfficeManager {
    constructor(canvasId, employees) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.employees = employees;
        this.clock = new GameClock();
        this.layout = this.createOfficeLayout();

        // 各従業員にスケジュールとステートマシンを設定
        this.employees.forEach(employee => {
            employee.schedule = new EmployeeSchedule(employee);
            employee.stateMachine = new EmployeeStateMachine(
                employee,
                employee.schedule,
                this.layout
            );
        });

        this.startAnimationLoop();
    }

    createOfficeLayout() {
        return {
            entrance: { x: 400, y: 580 },
            exit: { x: 400, y: 580 },
            breakRoom: { x: 350, y: 300 },
            desks: {
                development: [
                    { x: 100, y: 100 },
                    { x: 200, y: 100 },
                    { x: 300, y: 100 }
                ],
                sales: [
                    { x: 500, y: 100 },
                    { x: 600, y: 100 }
                ],
                planning: [
                    { x: 100, y: 400 },
                    { x: 200, y: 400 }
                ]
            },
            getDesk: function(department) {
                const deskList = this.desks[department];
                if (!deskList || deskList.length === 0) {
                    return { x: 400, y: 300 }; // デフォルト位置
                }
                return deskList[Math.floor(Math.random() * deskList.length)];
            },
            getProjectArea: function(project) {
                return { x: 425, y: 300 }; // 会議エリア
            }
        };
    }

    startAnimationLoop() {
        let lastTime = performance.now();

        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // 時計を進める
            this.clock.update(deltaTime);

            // 全従業員を更新
            this.employees.forEach(employee => {
                employee.stateMachine.update(deltaTime, this.clock);
            });

            // 描画
            this.render();

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    render() {
        // キャンバスクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 背景描画
        this.renderBackground();

        // 時計表示
        this.renderClock();

        // 従業員描画
        this.employees.forEach(employee => {
            if (employee.visible) {
                employee.render(this.ctx);
            }
        });
    }

    renderClock() {
        this.ctx.font = 'bold 20px sans-serif';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText(this.clock.getFormattedTime(), 20, 30);
    }

    renderBackground() {
        // オフィスレイアウト描画
        // （省略 - 前回のOfficeVisualizationクラスを参照）
    }
}
```

---

## 4. 実装計画

### フェーズ1: 基礎システム（2-3時間）

1. **GameClock** - ゲーム内時間管理
2. **EmployeeSchedule** - スケジュール管理
3. **EmployeeStateMachine** - 基本ステート実装（5状態）

### フェーズ2: アニメーション（2-3時間）

4. **EmployeeSprite** - 絵文字ベースのレンダリング
5. **MovementSystem** - 移動アニメーション
6. **IdleAnimationManager** - ランダムなアイドル動作

### フェーズ3: 統合（1-2時間）

7. **OfficeManager** - 全システム統合
8. ゲームループとの連携
9. UI表示（時計、状態表示）

### フェーズ4: 拡張（2-3時間）

10. プロジェクト作業時の集合アニメーション
11. 会議イベント
12. 施設利用（自販機、トイレ）
13. パフォーマンス最適化

**総所要時間**: 7-11時間

---

## 5. 技術的な実装上の注意点

### 5.1 パフォーマンス最適化

#### 問題
30人以上の従業員がそれぞれ独立してステートマシンを実行すると重い。

#### 解決策

```javascript
// 時間分割更新（Time-Slicing）
class OptimizedOfficeManager extends OfficeManager {
    constructor(canvasId, employees) {
        super(canvasId, employees);
        this.updateBatchSize = 5; // 1フレームで5人まで更新
        this.currentBatchIndex = 0;
    }

    update(deltaTime) {
        // バッチ更新
        for (let i = 0; i < this.updateBatchSize; i++) {
            const index = (this.currentBatchIndex + i) % this.employees.length;
            this.employees[index].stateMachine.update(deltaTime, this.clock);
        }

        this.currentBatchIndex = (this.currentBatchIndex + this.updateBatchSize) % this.employees.length;
    }
}
```

### 5.2 パスファインディング

#### シンプルアプローチ（推奨）
直線移動 + 障害物回避

```javascript
class SimplePathfinder {
    findPath(start, end, obstacles) {
        // 直線で行けるかチェック
        if (!this.hasObstacle(start, end, obstacles)) {
            return [start, end];
        }

        // 簡易ウェイポイント経由
        const waypoint = this.findNearestWaypoint(start, end);
        return [start, waypoint, end];
    }
}
```

#### 高度なアプローチ（オプション）
A*アルゴリズム実装（50人以上の場合のみ）

### 5.3 アニメーションデータ

#### 絵文字ベース（推奨）

```javascript
const EMPLOYEE_ANIMATIONS = {
    idle: {
        frames: ['👨‍💼', '👨‍💼'], // 同じ絵文字（呼吸アニメーションはCSS）
        duration: 2000
    },
    walk: {
        frames: ['🚶', '🚶‍♂️'],
        duration: 300
    },
    typing: {
        frames: ['👨‍💻', '💻', '👨‍💻', '⌨️'],
        duration: 500
    },
    resting: {
        frames: ['😌', '☕'],
        duration: 1000
    },
    stretch: {
        frames: ['🙆', '🙆‍♂️', '😊'],
        duration: 800
    }
};
```

#### スプライトシート（高度）
16x16ピクセルアニメーション（カイロソフト完全再現の場合）

---

## 6. 参考リソース

### 学習リソース

1. **Behavior Trees**
   - [Complete Implementation Tutorial 2025](https://generalistprogrammer.com/tutorials/game-ai-behavior-trees-complete-implementation-tutorial)
   - [Game Developer Article](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work)

2. **State Machines**
   - [State Machines for JavaScript Developers](https://blog.openreplay.com/state-machines-for-javascript-developers-how-to-use-them-in-your-apps/)
   - [XState Library](https://xstate.js.org/)

3. **Idle Animations**
   - [Programming Natural Idle Character Animations](https://dev.to/arkfuldodger/programming-natural-idle-character-animations-4l0g)

### オープンソース実装例

- **簡易ステートマシン**: [GitHub - javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine)
- **行動ツリーライブラリ**: [GitHub - behavior3js](https://github.com/behavior3/behavior3js)

---

## 7. 結論

### 実装可能性: ✅ **非常に高い**

カイロソフトスタイルのキャラクター日常サイクルは、以下の理由で実装可能：

1. **シンプルなステートマシン**で十分対応可能
2. **Canvas 2D**で十分なパフォーマンス
3. **絵文字ベース**なら追加アセット不要
4. **Vanilla JavaScript**のみで実装可能（ライブラリ不要）

### 推奨アプローチ

**ハイブリッド方式**: スケジュール管理 + ステートマシン

```
[GameClock] → [EmployeeSchedule] → [EmployeeStateMachine] → [Canvas Rendering]
```

### 実装優先度

1. **必須**: 出勤・退勤・デスク作業
2. **推奨**: 休憩、プロジェクト作業
3. **オプション**: ランダムアイドル動作、施設利用

### 次のステップ

資格システム実装完了後、このリサーチをもとに以下を実装：

1. ✅ GameClockの実装（1時間）
2. ✅ EmployeeScheduleの実装（1時間）
3. ✅ EmployeeStateMachineの実装（2時間）
4. ✅ Canvas統合とテスト（2時間）

**合計予想時間**: 6時間

---

**レポート作成者**: Claude (Multi-AI Orchestration)
**承認**: 実装可能と判定
