import{C as bn,L as Jr,D as Xr,R as es,a as ts,b as ns,P as is,c as os,A as as,d as rs,p as ss,e as cs,f as ls,i as ds}from"./chart-D6HXaBsp.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const us={developer:"🧑‍💻",sales:"🧑‍💼",marketing:"🧑‍🎨",manager:"🧑‍💼"},Ji={levelUp:"⬆️",money:"💰",happy:"😊",sad:"😢",sparkle:"✨"};class ps{constructor(){this.container=null,this.characters=new Map,this.isInitialized=!1}init(t){const n=document.getElementById(t);n&&(n.innerHTML=`
      <div class="office-characters">
        <div class="office-floor"></div>
        <div class="office-plant" style="left: 10px; bottom: 70px;">🌿</div>
        <div class="office-plant" style="right: 10px; bottom: 70px;">🪴</div>
      </div>
    `,this.container=n.querySelector(".office-characters"),this.isInitialized=!0)}addCharacter(t,n,i,o){if(!this.container||!this.isInitialized)return;this.characters.has(t)&&this.removeCharacter(t);const a=50+Math.random()*(this.container.clientWidth-100),r=80+Math.random()*150,c=document.createElement("div");c.className="character idle",c.dataset.job=i,c.dataset.employeeId=t,c.style.left=`${a}px`,c.style.bottom=`${r}px`;const d=document.createElement("div");d.className="character-emoji",d.textContent=us[i];const u=document.createElement("div");u.className="character-name",u.textContent=n,c.appendChild(d),c.appendChild(u),o&&c.addEventListener("click",o),this.container.appendChild(c),this.characters.set(t,{id:t,element:c,jobType:i,state:"idle",x:a,y:r,clickHandler:o})}setAnimation(t,n){const i=this.characters.get(t);if(!i)return;i.element.classList.remove("idle","working","stressed"),i.element.classList.add(n),i.state=n;let o=i.element.querySelector(".character-status");switch(o||(o=document.createElement("div"),o.className="character-status",i.element.appendChild(o)),n){case"working":o.textContent="⚡";break;case"stressed":o.textContent="😰";break;default:o.textContent=""}}removeCharacter(t){const n=this.characters.get(t);n&&(n.clickHandler&&n.element.removeEventListener("click",n.clickHandler),n.element.remove(),this.characters.delete(t))}clearAllCharacters(){this.characters.forEach(t=>{t.clickHandler&&t.element.removeEventListener("click",t.clickHandler),t.element.remove()}),this.characters.clear()}getCharacter(t){return this.characters.get(t)}getAllCharacters(){return this.characters}playEffect(t,n){const i=this.characters.get(t);if(!i)return;const o=document.createElement("div");o.className="character-effect",o.textContent=Ji[n]||Ji.sparkle,i.element.appendChild(o),o.addEventListener("animationend",()=>o.remove(),{once:!0}),setTimeout(()=>o.remove(),1100)}destroy(){this.clearAllCharacters(),this.container&&(this.container.innerHTML=""),this.container=null,this.isInitialized=!1}}const Pt=new ps;function ms(e){Pt.init(e)}const ue={development:{name:"開発部",emoji:"💻",primaryAbility:"technical",salaryMultiplier:1,description:"製品の開発を担当",abilityWeights:{technical:{min:60,max:95},sales:{min:20,max:60},planning:{min:40,max:80},management:{min:30,max:70}},temperamentWeights:{creativity:20,conscientiousness:15,sociability:-15,cautiousness:10}},sales:{name:"営業部",emoji:"📈",primaryAbility:"sales",salaryMultiplier:1.1,description:"製品の販売を担当",abilityWeights:{technical:{min:20,max:60},sales:{min:60,max:95},planning:{min:30,max:70},management:{min:40,max:75}},temperamentWeights:{sociability:25,boldness:15,bravery:10,cautiousness:-15}},planning:{name:"企画部",emoji:"💡",primaryAbility:"planning",salaryMultiplier:.95,description:"新製品の企画を担当",abilityWeights:{technical:{min:40,max:75},sales:{min:35,max:75},planning:{min:60,max:95},management:{min:40,max:75}},temperamentWeights:{creativity:30,cooperation:15,boldness:10}},management:{name:"管理部",emoji:"📊",primaryAbility:"management",salaryMultiplier:1.05,description:"会社全体の管理を担当",abilityWeights:{technical:{min:30,max:70},sales:{min:30,max:70},planning:{min:40,max:75},management:{min:60,max:95}},temperamentWeights:{conscientiousness:25,cautiousness:20,emotionalStability:15,cooperation:10}}},be={staff:{name:"スタッフ",emoji:"👤",salaryMultiplier:1,requiredAbility:0,managementBonus:0,description:"一般社員"},senior:{name:"シニア",emoji:"⭐",salaryMultiplier:1.3,requiredAbility:70,managementBonus:.1,description:"上級社員"},manager:{name:"課長",emoji:"👔",salaryMultiplier:1.6,requiredAbility:80,managementBonus:.2,canManage:5,description:"課長職 (5名まで管理可能)"},director:{name:"部長",emoji:"💼",salaryMultiplier:2,requiredAbility:90,managementBonus:.3,canManage:15,description:"部長職 (15名まで管理可能)"}},ze={technical:{name:"技術スキル",emoji:"💻",color:"#667eea",skills:{tech_basic:{name:"プログラミング基礎",description:"基本的なコーディングスキルを習得",cost:1,effect:{technical:5},prerequisites:[],tier:1,icon:"📝"},tech_advanced:{name:"アーキテクチャ設計",description:"システム全体の設計能力を獲得",cost:2,effect:{technical:10,planning:3},prerequisites:["tech_basic"],tier:2,icon:"🏗️"},tech_optimization:{name:"パフォーマンス最適化",description:"コードを高速化し品質を向上",cost:2,effect:{technical:8},prerequisites:["tech_advanced"],tier:3,icon:"⚡",special:"product_quality_bonus"},tech_ai:{name:"AI・機械学習",description:"最新のAI技術を活用できる",cost:3,effect:{technical:15,planning:5},prerequisites:["tech_advanced"],tier:3,icon:"🤖"},tech_security:{name:"セキュリティエキスパート",description:"セキュリティの専門知識を獲得",cost:2,effect:{technical:10,management:3},prerequisites:["tech_basic"],tier:2,icon:"🔒"}}},sales:{name:"営業スキル",emoji:"📈",color:"#f093fb",skills:{sales_basic:{name:"顧客対応基礎",description:"基本的な営業スキルを習得",cost:1,effect:{sales:5},prerequisites:[],tier:1,icon:"🤝"},sales_negotiation:{name:"交渉術",description:"高度な交渉テクニックを獲得",cost:2,effect:{sales:10,management:3},prerequisites:["sales_basic"],tier:2,icon:"💼"},sales_presentation:{name:"プレゼンテーション",description:"説得力のある提案ができる",cost:2,effect:{sales:8,planning:4},prerequisites:["sales_basic"],tier:2,icon:"📊"},sales_closing:{name:"クロージング技術",description:"確実に契約を獲得できる",cost:3,effect:{sales:15},prerequisites:["sales_negotiation","sales_presentation"],tier:3,icon:"🎯",special:"revenue_bonus"},sales_account:{name:"アカウント管理",description:"長期的な顧客関係を構築",cost:2,effect:{sales:10,management:5},prerequisites:["sales_negotiation"],tier:3,icon:"📇"}}},planning:{name:"企画スキル",emoji:"💡",color:"#4facfe",skills:{plan_basic:{name:"企画立案基礎",description:"基本的な企画力を習得",cost:1,effect:{planning:5},prerequisites:[],tier:1,icon:"✏️"},plan_market:{name:"市場分析",description:"市場動向を読み取る力を獲得",cost:2,effect:{planning:10,sales:3},prerequisites:["plan_basic"],tier:2,icon:"🔍"},plan_innovation:{name:"イノベーション思考",description:"革新的なアイデアを生み出せる",cost:3,effect:{planning:15,technical:5},prerequisites:["plan_market"],tier:3,icon:"💫",special:"product_innovation_bonus"},plan_strategy:{name:"戦略立案",description:"長期的な戦略を策定できる",cost:2,effect:{planning:10,management:5},prerequisites:["plan_basic"],tier:2,icon:"🎲"},plan_ux:{name:"UX設計",description:"ユーザー体験を最適化できる",cost:2,effect:{planning:8,technical:4},prerequisites:["plan_basic"],tier:2,icon:"🎨"}}},management:{name:"管理スキル",emoji:"📊",color:"#f857a6",skills:{mgmt_basic:{name:"プロジェクト管理基礎",description:"基本的な管理スキルを習得",cost:1,effect:{management:5},prerequisites:[],tier:1,icon:"📋"},mgmt_team:{name:"チームマネジメント",description:"チームを効果的に管理できる",cost:2,effect:{management:10,sales:3},prerequisites:["mgmt_basic"],tier:2,icon:"👥",special:"team_productivity_bonus"},mgmt_finance:{name:"財務管理",description:"予算管理と財務分析ができる",cost:2,effect:{management:10},prerequisites:["mgmt_basic"],tier:2,icon:"💰",special:"cost_reduction"},mgmt_leadership:{name:"リーダーシップ",description:"組織全体を牽引できる",cost:3,effect:{management:15,sales:5},prerequisites:["mgmt_team"],tier:3,icon:"👑",special:"company_bonus"},mgmt_risk:{name:"リスク管理",description:"リスクを予測し対処できる",cost:2,effect:{management:8,planning:4},prerequisites:["mgmt_basic"],tier:2,icon:"🛡️"}}}},Bo={product_quality_bonus:{description:"製品品質+10%",value:.1},revenue_bonus:{description:"売上+5%",value:.05},product_innovation_bonus:{description:"新製品開発時間-20%",value:.2},team_productivity_bonus:{description:"チーム生産性+15%",value:.15},cost_reduction:{description:"運営コスト-10%",value:.1},company_bonus:{description:"全従業員の能力+3",value:3}},_n={easy:{name:"イージー",emoji:"😊",description:"初心者向け。資金2倍、競合は穏やか",startingMoney:2e7,competitorAggressiveness:.5,marketGrowthRate:1.2,eventFrequency:.7,poachingRisk:.3},normal:{name:"ノーマル",emoji:"💼",description:"標準的な難易度。バランスの取れた挑戦",startingMoney:1e7,competitorAggressiveness:1,marketGrowthRate:1,eventFrequency:1,poachingRisk:.6},hard:{name:"ハード",emoji:"🔥",description:"上級者向け。資金半分、競合は攻撃的",startingMoney:5e6,competitorAggressiveness:1.5,marketGrowthRate:.8,eventFrequency:1.3,poachingRisk:.9}},ri={aggressive:{name:"攻撃的",emoji:"⚔️",description:"積極的にシェア拡大を狙う",shareGrowthRate:1.5,poachingChance:.3,priceWarChance:.4,marketingChance:.2},balanced:{name:"バランス型",emoji:"⚖️",description:"状況に応じた柔軟な戦略",shareGrowthRate:1,poachingChance:.15,priceWarChance:.2,marketingChance:.3},defensive:{name:"守備的",emoji:"🛡️",description:"既存シェアの維持を重視",shareGrowthRate:.7,poachingChance:.05,priceWarChance:.1,marketingChance:.15},innovative:{name:"革新的",emoji:"🚀",description:"技術革新で市場を切り拓く",shareGrowthRate:1.2,poachingChance:.2,priceWarChance:.1,marketingChance:.4}},Lo=[{id:"techcorp",name:"テックコープ",ceo:{name:"田中 剛志",emoji:"👔",quote:"勝つためには手段を選ばない"},strategy:"aggressive",initialShare:35,power:100,speciality:"大規模システム開発",color:"#e74c3c",alertLevel:0,lastAction:"",actionCooldown:0},{id:"digitalworks",name:"デジタルワークス",ceo:{name:"鈴木 智子",emoji:"👩‍💼",quote:"バランスこそが成功の鍵"},strategy:"balanced",initialShare:29,power:85,speciality:"Web・モバイル開発",color:"#3498db",alertLevel:0,lastAction:"",actionCooldown:0},{id:"cybersoft",name:"サイバーソフト",ceo:{name:"山田 孝志",emoji:"🧓",quote:"堅実な経営が一番だ"},strategy:"defensive",initialShare:22,power:70,speciality:"業務システム保守",color:"#2ecc71",alertLevel:0,lastAction:"",actionCooldown:0},{id:"innovatech",name:"イノバテック",ceo:{name:"佐藤 未来",emoji:"👨‍🔬",quote:"技術で世界を変える"},strategy:"innovative",initialShare:10,power:60,speciality:"AI・先端技術",color:"#9b59b6",alertLevel:0,lastAction:"",actionCooldown:0}],fs=[{category:"market",emoji:"📈",template:"IT業界に追い風！政府のDX推進で市場拡大",impact:"positive"},{category:"market",emoji:"📉",template:"景気減速の兆し、IT投資に慎重ムード広がる",impact:"negative"},{category:"market",emoji:"🔥",template:"スタートアップブーム到来！新規参入が相次ぐ",impact:"neutral"},{category:"market",emoji:"💹",template:"IT人材の需要が過去最高を記録",impact:"positive"},{category:"market",emoji:"⚠️",template:"円安の影響でIT機器のコストが上昇",impact:"negative"},{category:"competitor",emoji:"🏢",template:"${company}が新製品を発表！業界に衝撃",impact:"neutral"},{category:"competitor",emoji:"📊",template:"${company}の売上が${percent}%増加",impact:"neutral"},{category:"competitor",emoji:"💼",template:"${company}が大型買収を検討中",impact:"neutral"},{category:"competitor",emoji:"🎯",template:"${company}のCEO「市場シェア拡大を目指す」",impact:"neutral"},{category:"competitor",emoji:"⚔️",template:"${company}が価格競争を仕掛ける！",impact:"negative",conditions:{competitorStrategy:"aggressive"}},{category:"competitor",emoji:"🎖️",template:"${company}が業界表彰を受賞",impact:"neutral"},{category:"technology",emoji:"🤖",template:"AI技術革命！生成AI市場が急拡大",impact:"positive"},{category:"technology",emoji:"☁️",template:"クラウドサービスの需要が急増中",impact:"positive"},{category:"technology",emoji:"🔒",template:"サイバーセキュリティの重要性が高まる",impact:"neutral"},{category:"technology",emoji:"📱",template:"モバイルファースト時代、アプリ開発が活況",impact:"positive"},{category:"technology",emoji:"⚡",template:"新技術の登場で市場が活性化",impact:"positive"},{category:"economy",emoji:"💰",template:"ベンチャー投資が活発化、資金調達しやすい環境に",impact:"positive"},{category:"economy",emoji:"📉",template:"金利上昇で企業の借入コスト増加",impact:"negative"},{category:"economy",emoji:"🏛️",template:"政府がIT産業支援策を発表",impact:"positive"},{category:"economy",emoji:"🌍",template:"海外IT企業の日本市場参入が加速",impact:"negative"},{category:"player",emoji:"🌟",template:"新興企業が急成長！業界の注目を集める",impact:"positive",conditions:{minPlayerShare:5}},{category:"player",emoji:"🚀",template:"躍進するスタートアップ、大手も警戒",impact:"positive",conditions:{minPlayerShare:10}},{category:"player",emoji:"👀",template:"${company}が新興企業の動向を注視",impact:"neutral",conditions:{minPlayerShare:15}},{category:"player",emoji:"⚠️",template:"大手企業が新興勢力への対抗策を検討",impact:"negative",conditions:{minPlayerShare:20}},{category:"event",emoji:"🏆",template:"IT企業ランキング発表！上位は大きく変動",impact:"neutral"},{category:"event",emoji:"📰",template:"業界専門誌が今年のトレンドを予測",impact:"neutral"},{category:"event",emoji:"🎓",template:"IT人材育成のための産学連携が活発化",impact:"positive"}],Zo={poaching:{name:"引き抜き攻勢",emoji:"🎯",description:"${company}があなたの優秀な社員に接触しています！",effect:"employee_risk"},priceWar:{name:"価格競争",emoji:"💸",description:"${company}が大幅値下げを開始！市場シェアに影響",effect:"share_decrease"},marketing:{name:"マーケティング攻勢",emoji:"📺",description:"${company}が大規模広告キャンペーンを展開",effect:"brand_decrease"},partnership:{name:"提携戦略",emoji:"🤝",description:"${company}が有力企業との提携を発表",effect:"competitor_boost"}},on={LOAN_AMOUNT:5e6,LOAN_INTEREST_RATE:.02},Xi=["${company}が新製品を発表！業界に衝撃","${company}の売上が${percent}%増加","IT業界の成長率が${percent}%に","${company}が大型買収を検討中","新技術の登場で市場が活性化","${company}のCEOが今後の戦略を語る","スタートアップ企業の参入が相次ぐ"],dt={economy:{productRevenueMultiplier:1e4,productRevenueBase:5e4,marketShareRevenueBonus:.02,brandPowerRevenueBonus:.05},difficultyMultipliers:{easy:{revenueMultiplier:1.3,costMultiplier:.8,growthMultiplier:1.2,competitorStrength:.7},normal:{revenueMultiplier:1,costMultiplier:1,growthMultiplier:1,competitorStrength:1},hard:{revenueMultiplier:.8,costMultiplier:1.2,growthMultiplier:.8,competitorStrength:1.3}}};const si={common:{name:"コモン",color:"#6c757d",bgColor:"#f8f9fa"},uncommon:{name:"アンコモン",color:"#28a745",bgColor:"#e8f5e9"},rare:{name:"レア",color:"#007bff",bgColor:"#e3f2fd"},epic:{name:"エピック",color:"#6f42c1",bgColor:"#f3e5f5"},legendary:{name:"レジェンダリー",color:"#fd7e14",bgColor:"#fff3e0"}},wn=[{id:"first_profit",name:"初めての黒字",description:"月次決算で初めて黒字を達成",emoji:"💰",category:"money",rarity:"common",condition:{type:"monthly_profit",value:1,comparison:"gte"},reward:{type:"brandPower",value:1}},{id:"millionaire",name:"1000万円達成",description:"資金が1000万円を超えた",emoji:"💵",category:"money",rarity:"common",condition:{type:"money",value:1e7,comparison:"gte"}},{id:"ten_millionaire",name:"1億円達成",description:"資金が1億円を超えた",emoji:"💎",category:"money",rarity:"rare",condition:{type:"money",value:1e8,comparison:"gte"},reward:{type:"brandPower",value:5}},{id:"debt_free",name:"無借金経営",description:"借金なしで資金5000万円以上",emoji:"🏦",category:"money",rarity:"epic",condition:{type:"debt_free_rich",value:5e7,comparison:"gte"},reward:{type:"brandPower",value:10}},{id:"first_hire",name:"初めての採用",description:"最初の従業員を採用した",emoji:"👤",category:"employees",rarity:"common",condition:{type:"employees",value:2,comparison:"gte"}},{id:"team_of_ten",name:"10人のチーム",description:"従業員が10人になった",emoji:"👥",category:"employees",rarity:"uncommon",condition:{type:"employees",value:10,comparison:"gte"},reward:{type:"motivation",value:5}},{id:"large_company",name:"大企業への道",description:"従業員が50人になった",emoji:"🏢",category:"employees",rarity:"rare",condition:{type:"employees",value:50,comparison:"gte"},reward:{type:"brandPower",value:5}},{id:"elite_team",name:"エリート集団",description:"全従業員の平均能力が80以上",emoji:"⭐",category:"employees",rarity:"epic",condition:{type:"avg_ability",value:80,comparison:"gte"},reward:{type:"brandPower",value:10}},{id:"first_product",name:"初めての製品",description:"最初の製品を開発した",emoji:"📦",category:"products",rarity:"common",condition:{type:"products",value:1,comparison:"gte"}},{id:"product_lineup",name:"製品ラインナップ",description:"5つの製品を開発した",emoji:"📚",category:"products",rarity:"uncommon",condition:{type:"products",value:5,comparison:"gte"}},{id:"quality_master",name:"品質マスター",description:"品質100の製品を開発",emoji:"🏆",category:"products",rarity:"rare",condition:{type:"max_quality",value:100,comparison:"gte"},reward:{type:"brandPower",value:5}},{id:"bestseller",name:"ベストセラー",description:"1つの製品で売上1億円達成",emoji:"🎯",category:"products",rarity:"epic",condition:{type:"product_sales",value:1e8,comparison:"gte"},reward:{type:"money",value:5e6}},{id:"market_entry",name:"市場参入",description:"市場シェア1%達成",emoji:"📊",category:"market",rarity:"common",condition:{type:"marketShare",value:1,comparison:"gte"}},{id:"rising_star",name:"ライジングスター",description:"市場シェア10%達成",emoji:"🌟",category:"market",rarity:"uncommon",condition:{type:"marketShare",value:10,comparison:"gte"},reward:{type:"brandPower",value:3}},{id:"market_leader",name:"マーケットリーダー",description:"市場シェア30%達成",emoji:"👑",category:"market",rarity:"rare",condition:{type:"marketShare",value:30,comparison:"gte"},reward:{type:"brandPower",value:10}},{id:"market_dominator",name:"市場支配者",description:"市場シェア50%達成",emoji:"🏰",category:"market",rarity:"legendary",condition:{type:"marketShare",value:50,comparison:"gte"},reward:{type:"money",value:1e7}},{id:"survivor",name:"サバイバー",description:"12ヶ月（12ターン）生き残った",emoji:"🎖️",category:"special",rarity:"uncommon",condition:{type:"turns",value:12,comparison:"gte"}},{id:"veteran",name:"ベテラン経営者",description:"36ヶ月（36ターン）経営を続けた",emoji:"🎗️",category:"special",rarity:"rare",condition:{type:"turns",value:36,comparison:"gte"},reward:{type:"brandPower",value:5}},{id:"brand_master",name:"ブランドマスター",description:"ブランド力50達成",emoji:"✨",category:"special",rarity:"rare",condition:{type:"brandPower",value:50,comparison:"gte"}},{id:"office_max",name:"本社ビル",description:"オフィスレベル5達成",emoji:"🏙️",category:"special",rarity:"legendary",condition:{type:"officeLevel",value:5,comparison:"gte"},reward:{type:"money",value:2e7}},{id:"comeback",name:"カムバック",description:"資金が100万円以下から1000万円に復活",emoji:"🔥",category:"special",rarity:"epic",condition:{type:"comeback",value:1e7,comparison:"gte"},hidden:!0,reward:{type:"brandPower",value:10}},{id:"speed_runner",name:"スピードランナー",description:"6ターン以内に市場シェア10%達成",emoji:"⚡",category:"special",rarity:"legendary",condition:{type:"speed_share",value:10,comparison:"gte"},hidden:!0,reward:{type:"money",value:5e6}}],Ye=[{id:"welcome",title:"ようこそ！",description:"ビジネスエンパイアへようこそ！IT企業の経営者として成功を目指しましょう。",emoji:"👋"},{id:"overview",title:"概要タブ",description:"概要タブでは、会社の現在の状態を確認できます。資金、従業員数、売上などが表示されています。",emoji:"📊",targetElement:'.tab[data-panel="overview"]'},{id:"hire_first",title:"従業員を採用しよう",description:"人事タブで従業員を採用しましょう。従業員がいないと製品を開発できません。",emoji:"👥",targetElement:'.tab[data-panel="employees"]',action:"hire_employee",reward:{type:"money",value:1e5}},{id:"develop_product",title:"製品を開発しよう",description:"製品タブで新しい製品を開発しましょう。製品を販売することで売上が発生します。",emoji:"📦",targetElement:'.tab[data-panel="products"]',action:"develop_product",reward:{type:"money",value:2e5}},{id:"check_market",title:"市場を確認しよう",description:"市場タブでは競合企業の状況や自社の市場シェアを確認できます。",emoji:"📈",targetElement:'.tab[data-panel="market"]'},{id:"next_turn",title:"ターンを進めよう",description:"「ターン終了」ボタンを押すと時間が進み、売上が発生します。経営を続けて会社を成長させましょう！",emoji:"⏩",targetElement:"#endTurnBtn",action:"end_turn",reward:{type:"brandPower",value:1}},{id:"complete",title:"チュートリアル完了！",description:"これで基本操作は完了です。市場シェアを拡大し、業界トップを目指しましょう！",emoji:"🎉",reward:{type:"money",value:5e5}}],le={passionate:{name:"情熱家",emoji:"🔥",effects:{developmentSpeed:1.2},compatible:["optimist","charismatic"],incompatible:["cautious"]},logical:{name:"論理思考型",emoji:"🧠",effects:{bugRate:.7},compatible:["perfectionist","researcher"],incompatible:["intuitive"]},cooperative:{name:"協調性重視",emoji:"🤝",effects:{teamEfficiency:1.15},compatible:["passionate","optimist"],incompatible:["lone_genius"]},ambitious:{name:"野心家",emoji:"💼",effects:{promotionDesire:1.3},compatible:["strategist"],incompatible:["cooperative"]},charismatic:{name:"カリスマ",emoji:"🌟",effects:{salesPower:1.25},compatible:["passionate","optimist"],incompatible:["introverted"]},perfectionist:{name:"完璧主義者",emoji:"🎯",effects:{quality:1.2,speed:.9},compatible:["logical","researcher"],incompatible:["optimist"]},action_oriented:{name:"行動派",emoji:"🚀",effects:{decisionSpeed:1.2},compatible:["intuitive"],incompatible:["cautious"]},researcher:{name:"研究者気質",emoji:"📚",effects:{learningSpeed:1.3},compatible:["logical","introverted"],incompatible:["action_oriented"]},optimist:{name:"楽観主義者",emoji:"😊",effects:{stressResistance:1.2},compatible:["passionate","charismatic"],incompatible:["perfectionist"]},cautious:{name:"慎重派",emoji:"🔒",effects:{riskManagement:1.25},compatible:["strategist","perfectionist"],incompatible:["action_oriented","passionate"]},creative:{name:"クリエイター",emoji:"🎨",effects:{creativity:1.3},compatible:["intuitive"],incompatible:["logical"]},intuitive:{name:"直感型",emoji:"⚡",effects:{inspirationRate:1.2},compatible:["creative","action_oriented"],incompatible:["logical","cautious"]},introverted:{name:"内向的",emoji:"🧘",effects:{soloWork:1.25},compatible:["researcher"],incompatible:["charismatic","cooperative"]},lone_genius:{name:"孤高の天才",emoji:"🏔️",effects:{ability:1.4,cooperation:.5},compatible:[],incompatible:["cooperative","charismatic"]},strategist:{name:"戦略家",emoji:"🗺️",effects:{projectSuccess:1.15},compatible:["cautious","ambitious"],incompatible:["intuitive"]}},$t={code_reviewer:{name:"コードレビュアー",emoji:"🔍",effect:"バグ発見率+40%"},debugger:{name:"デバッガー",emoji:"🐛",effect:"バグ修正速度+50%"},architect:{name:"アーキテクト",emoji:"🏗️",effect:"大規模開発で能力1.5倍"},rapid_dev:{name:"速攻開発",emoji:"⚡",effect:"小規模開発を1ターンで完了"},inspiration:{name:"ひらめき",emoji:"💡",effect:"月1回、画期的機能を思いつく"},trend_catcher:{name:"トレンドキャッチャー",emoji:"📡",effect:"市場ニーズ予測+30%"},tech_foresight:{name:"技術先読み",emoji:"🔮",effect:"新技術登場を2ターン前に察知"},mentor:{name:"メンター",emoji:"👨‍🏫",effect:"新人育成速度+50%"},mediator:{name:"調停者",emoji:"⚖️",effect:"チーム対立を解消"},networker:{name:"ネットワーカー",emoji:"🌐",effect:"外部人脈で情報入手"},steel_mind:{name:"鋼のメンタル",emoji:"🛡️",effect:"デスマーチでも能力低下なし"},crunch_resistant:{name:"クランチ耐性",emoji:"💪",effect:"残業続きでも健康維持"},pressure_converter:{name:"プレッシャー変換",emoji:"⚡",effect:"締切直前に能力+30%"},easily_bored:{name:"飽き性",emoji:"😑",effect:"3ヶ月で能力-20%",negative:!0},morning_weak:{name:"朝が苦手",emoji:"😴",effect:"午前中の作業効率-30%",negative:!0},over_perfectionist:{name:"完璧主義すぎる",emoji:"⏰",effect:"納期遅延リスク+20%",negative:!0},fast_learner:{name:"早習得",emoji:"📖",effect:"研修効果+50%"},cost_conscious:{name:"コスト意識",emoji:"💰",effect:"無駄な支出を15%削減"},health_conscious:{name:"健康志向",emoji:"🥗",effect:"病欠リスク-50%"},night_owl:{name:"夜型人間",emoji:"🦉",effect:"深夜作業で能力+20%"}},eo={boldness:{name:"大胆さ",emoji:"🎲",description:"新しい挑戦やリスクを恐れない度合い",effects:"新製品開発時のボーナス、失敗時のダメージ軽減"},bravery:{name:"勇敢さ",emoji:"⚔️",description:"困難や危機に立ち向かう力",effects:"プレッシャー下でのパフォーマンス向上、納期間近の効率UP"},cooperation:{name:"協調性",emoji:"🤝",description:"チームワークや他者との協力を重視",effects:"チームボーナス増加、部署効率UP、相性判定に影響"},creativity:{name:"創造性",emoji:"💡",description:"斬新な発想やアイデアを生み出す力",effects:"企画職・開発職での効率ボーナス、イノベーション確率UP"},conscientiousness:{name:"誠実性",emoji:"📝",description:"責任感・真面目さ・コツコツ努力する傾向",effects:"品質向上、バグ率低減、長期プロジェクトでのボーナス"},emotionalStability:{name:"感情安定性",emoji:"🧘",description:"ストレス耐性、情緒の安定",effects:"残業時の効率低下を軽減、長期勤務でのモチベーション維持"},sociability:{name:"社交性",emoji:"🗣️",description:"他者との交流やコミュニケーション能力",effects:"営業職での効率ボーナス、顧客満足度UP、採用活動補助"},cautiousness:{name:"慎重さ",emoji:"🔍",description:"リスク回避、計画的な行動",effects:"バグ率低減、プロジェクト失敗率減少、管理職向き"}};function $n(e=null){const t={boldness:30+Math.floor(Math.random()*50),bravery:30+Math.floor(Math.random()*50),cooperation:30+Math.floor(Math.random()*50),creativity:30+Math.floor(Math.random()*50),conscientiousness:30+Math.floor(Math.random()*50),emotionalStability:30+Math.floor(Math.random()*50),sociability:30+Math.floor(Math.random()*50),cautiousness:30+Math.floor(Math.random()*50)};if(e&&le[e]){const i={passionate:{boldness:20,cautiousness:-15,emotionalStability:-10},logical:{creativity:-10,conscientiousness:15,cautiousness:20},cooperative:{cooperation:25,sociability:15},ambitious:{boldness:25,cooperation:-15},charismatic:{sociability:25,bravery:15},perfectionist:{conscientiousness:25,cautiousness:20,boldness:-10},action_oriented:{boldness:20,cautiousness:-20,bravery:15},researcher:{creativity:15,sociability:-15,cautiousness:10},optimist:{emotionalStability:20,bravery:10},cautious:{cautiousness:25,boldness:-20},creative:{creativity:30,conscientiousness:-10},intuitive:{creativity:20,cautiousness:-15},introverted:{sociability:-25,emotionalStability:10},lone_genius:{sociability:-30,cooperation:-20,creativity:25},strategist:{cautiousness:20,conscientiousness:15}}[e];i&&Object.keys(i).forEach(o=>{t[o]=Math.max(0,Math.min(100,t[o]+i[o]))})}return t}const Ue={latent_leader:{name:"潜在リーダー",emoji:"🔥",effect:"6ヶ月後、突然マネジメント能力開花",revealTurn:24},late_bloomer:{name:"大器晩成",emoji:"💎",effect:"1年後に能力+50%",revealTurn:48},burnout_prone:{name:"燃え尽き症候群",emoji:"🔥➡️💨",effect:"成功後に突然退職リスク",revealTurn:36,negative:!0},self_taught:{name:"独学の天才",emoji:"🎓",effect:"研修なしで勝手にスキルアップ",revealTurn:12},inconsistent:{name:"ムラがある",emoji:"🌊",effect:"月ごとに能力が20-120%で変動",revealTurn:8,negative:!0}};var Yt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function gs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function Kt(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Zn={exports:{}};var to;function hs(){return to||(to=1,(function(e,t){(function(n){e.exports=n()})(function(){return(function n(i,o,a){function r(u,v){if(!o[u]){if(!i[u]){var f=typeof Kt=="function"&&Kt;if(!v&&f)return f(u,!0);if(c)return c(u,!0);var y=new Error("Cannot find module '"+u+"'");throw y.code="MODULE_NOT_FOUND",y}var $=o[u]={exports:{}};i[u][0].call($.exports,function(T){var L=i[u][1][T];return r(L||T)},$,$.exports,n,i,o,a)}return o[u].exports}for(var c=typeof Kt=="function"&&Kt,d=0;d<a.length;d++)r(a[d]);return r})({1:[function(n,i,o){(function(a){var r=a.MutationObserver||a.WebKitMutationObserver,c;if(r){var d=0,u=new r(T),v=a.document.createTextNode("");u.observe(v,{characterData:!0}),c=function(){v.data=d=++d%2}}else if(!a.setImmediate&&typeof a.MessageChannel<"u"){var f=new a.MessageChannel;f.port1.onmessage=T,c=function(){f.port2.postMessage(0)}}else"document"in a&&"onreadystatechange"in a.document.createElement("script")?c=function(){var A=a.document.createElement("script");A.onreadystatechange=function(){T(),A.onreadystatechange=null,A.parentNode.removeChild(A),A=null},a.document.documentElement.appendChild(A)}:c=function(){setTimeout(T,0)};var y,$=[];function T(){y=!0;for(var A,D,O=$.length;O;){for(D=$,$=[],A=-1;++A<O;)D[A]();O=$.length}y=!1}i.exports=L;function L(A){$.push(A)===1&&!y&&c()}}).call(this,typeof Yt<"u"?Yt:typeof self<"u"?self:typeof window<"u"?window:{})},{}],2:[function(n,i,o){var a=n(1);function r(){}var c={},d=["REJECTED"],u=["FULFILLED"],v=["PENDING"];i.exports=f;function f(S){if(typeof S!="function")throw new TypeError("resolver must be a function");this.state=v,this.queue=[],this.outcome=void 0,S!==r&&L(this,S)}f.prototype.catch=function(S){return this.then(null,S)},f.prototype.then=function(S,G){if(typeof S!="function"&&this.state===u||typeof G!="function"&&this.state===d)return this;var H=new this.constructor(r);if(this.state!==v){var J=this.state===u?S:G;$(H,J,this.outcome)}else this.queue.push(new y(H,S,G));return H};function y(S,G,H){this.promise=S,typeof G=="function"&&(this.onFulfilled=G,this.callFulfilled=this.otherCallFulfilled),typeof H=="function"&&(this.onRejected=H,this.callRejected=this.otherCallRejected)}y.prototype.callFulfilled=function(S){c.resolve(this.promise,S)},y.prototype.otherCallFulfilled=function(S){$(this.promise,this.onFulfilled,S)},y.prototype.callRejected=function(S){c.reject(this.promise,S)},y.prototype.otherCallRejected=function(S){$(this.promise,this.onRejected,S)};function $(S,G,H){a(function(){var J;try{J=G(H)}catch(pe){return c.reject(S,pe)}J===S?c.reject(S,new TypeError("Cannot resolve promise with itself")):c.resolve(S,J)})}c.resolve=function(S,G){var H=A(T,G);if(H.status==="error")return c.reject(S,H.value);var J=H.value;if(J)L(S,J);else{S.state=u,S.outcome=G;for(var pe=-1,ye=S.queue.length;++pe<ye;)S.queue[pe].callFulfilled(G)}return S},c.reject=function(S,G){S.state=d,S.outcome=G;for(var H=-1,J=S.queue.length;++H<J;)S.queue[H].callRejected(G);return S};function T(S){var G=S&&S.then;if(S&&(typeof S=="object"||typeof S=="function")&&typeof G=="function")return function(){G.apply(S,arguments)}}function L(S,G){var H=!1;function J($e){H||(H=!0,c.reject(S,$e))}function pe($e){H||(H=!0,c.resolve(S,$e))}function ye(){G(pe,J)}var we=A(ye);we.status==="error"&&J(we.value)}function A(S,G){var H={};try{H.value=S(G),H.status="success"}catch(J){H.status="error",H.value=J}return H}f.resolve=D;function D(S){return S instanceof this?S:c.resolve(new this(r),S)}f.reject=O;function O(S){var G=new this(r);return c.reject(G,S)}f.all=Z;function Z(S){var G=this;if(Object.prototype.toString.call(S)!=="[object Array]")return this.reject(new TypeError("must be an array"));var H=S.length,J=!1;if(!H)return this.resolve([]);for(var pe=new Array(H),ye=0,we=-1,$e=new this(r);++we<H;)je(S[we],we);return $e;function je(kt,Wt){G.resolve(kt).then(jn,function(st){J||(J=!0,c.reject($e,st))});function jn(st){pe[Wt]=st,++ye===H&&!J&&(J=!0,c.resolve($e,pe))}}}f.race=Q;function Q(S){var G=this;if(Object.prototype.toString.call(S)!=="[object Array]")return this.reject(new TypeError("must be an array"));var H=S.length,J=!1;if(!H)return this.resolve([]);for(var pe=-1,ye=new this(r);++pe<H;)we(S[pe]);return ye;function we($e){G.resolve($e).then(function(je){J||(J=!0,c.resolve(ye,je))},function(je){J||(J=!0,c.reject(ye,je))})}}},{1:1}],3:[function(n,i,o){(function(a){typeof a.Promise!="function"&&(a.Promise=n(2))}).call(this,typeof Yt<"u"?Yt:typeof self<"u"?self:typeof window<"u"?window:{})},{2:2}],4:[function(n,i,o){var a=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(s){return typeof s}:function(s){return s&&typeof Symbol=="function"&&s.constructor===Symbol&&s!==Symbol.prototype?"symbol":typeof s};function r(s,p){if(!(s instanceof p))throw new TypeError("Cannot call a class as a function")}function c(){try{if(typeof indexedDB<"u")return indexedDB;if(typeof webkitIndexedDB<"u")return webkitIndexedDB;if(typeof mozIndexedDB<"u")return mozIndexedDB;if(typeof OIndexedDB<"u")return OIndexedDB;if(typeof msIndexedDB<"u")return msIndexedDB}catch{return}}var d=c();function u(){try{if(!d||!d.open)return!1;var s=typeof openDatabase<"u"&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),p=typeof fetch=="function"&&fetch.toString().indexOf("[native code")!==-1;return(!s||p)&&typeof indexedDB<"u"&&typeof IDBKeyRange<"u"}catch{return!1}}function v(s,p){s=s||[],p=p||{};try{return new Blob(s,p)}catch(m){if(m.name!=="TypeError")throw m;for(var l=typeof BlobBuilder<"u"?BlobBuilder:typeof MSBlobBuilder<"u"?MSBlobBuilder:typeof MozBlobBuilder<"u"?MozBlobBuilder:WebKitBlobBuilder,g=new l,h=0;h<s.length;h+=1)g.append(s[h]);return g.getBlob(p.type)}}typeof Promise>"u"&&n(3);var f=Promise;function y(s,p){p&&s.then(function(l){p(null,l)},function(l){p(l)})}function $(s,p,l){typeof p=="function"&&s.then(p),typeof l=="function"&&s.catch(l)}function T(s){return typeof s!="string"&&(s=String(s)),s}function L(){if(arguments.length&&typeof arguments[arguments.length-1]=="function")return arguments[arguments.length-1]}var A="local-forage-detect-blob-support",D=void 0,O={},Z=Object.prototype.toString,Q="readonly",S="readwrite";function G(s){for(var p=s.length,l=new ArrayBuffer(p),g=new Uint8Array(l),h=0;h<p;h++)g[h]=s.charCodeAt(h);return l}function H(s){return new f(function(p){var l=s.transaction(A,S),g=v([""]);l.objectStore(A).put(g,"key"),l.onabort=function(h){h.preventDefault(),h.stopPropagation(),p(!1)},l.oncomplete=function(){var h=navigator.userAgent.match(/Chrome\/(\d+)/),m=navigator.userAgent.match(/Edge\//);p(m||!h||parseInt(h[1],10)>=43)}}).catch(function(){return!1})}function J(s){return typeof D=="boolean"?f.resolve(D):H(s).then(function(p){return D=p,D})}function pe(s){var p=O[s.name],l={};l.promise=new f(function(g,h){l.resolve=g,l.reject=h}),p.deferredOperations.push(l),p.dbReady?p.dbReady=p.dbReady.then(function(){return l.promise}):p.dbReady=l.promise}function ye(s){var p=O[s.name],l=p.deferredOperations.pop();if(l)return l.resolve(),l.promise}function we(s,p){var l=O[s.name],g=l.deferredOperations.pop();if(g)return g.reject(p),g.promise}function $e(s,p){return new f(function(l,g){if(O[s.name]=O[s.name]||Ii(),s.db)if(p)pe(s),s.db.close();else return l(s.db);var h=[s.name];p&&h.push(s.version);var m=d.open.apply(d,h);p&&(m.onupgradeneeded=function(_){var w=m.result;try{w.createObjectStore(s.storeName),_.oldVersion<=1&&w.createObjectStore(A)}catch(x){if(x.name!=="ConstraintError")throw x}}),m.onerror=function(_){_.preventDefault(),g(m.error)},m.onsuccess=function(){var _=m.result;_.onversionchange=function(w){w.target.close()},l(_),ye(s)}})}function je(s){return $e(s,!1)}function kt(s){return $e(s,!0)}function Wt(s,p){if(!s.db)return!0;var l=!s.db.objectStoreNames.contains(s.storeName),g=s.version<s.db.version,h=s.version>s.db.version;if(g&&(s.version,s.version=s.db.version),h||l){if(l){var m=s.db.version+1;m>s.version&&(s.version=m)}return!0}return!1}function jn(s){return new f(function(p,l){var g=new FileReader;g.onerror=l,g.onloadend=function(h){var m=btoa(h.target.result||"");p({__local_forage_encoded_blob:!0,data:m,type:s.type})},g.readAsBinaryString(s)})}function st(s){var p=G(atob(s.data));return v([p],{type:s.type})}function ji(s){return s&&s.__local_forage_encoded_blob}function Xa(s){var p=this,l=p._initReady().then(function(){var g=O[p._dbInfo.name];if(g&&g.dbReady)return g.dbReady});return $(l,s,s),l}function er(s){pe(s);for(var p=O[s.name],l=p.forages,g=0;g<l.length;g++){var h=l[g];h._dbInfo.db&&(h._dbInfo.db.close(),h._dbInfo.db=null)}return s.db=null,je(s).then(function(m){return s.db=m,Wt(s)?kt(s):m}).then(function(m){s.db=p.db=m;for(var _=0;_<l.length;_++)l[_]._dbInfo.db=m}).catch(function(m){throw we(s,m),m})}function Ie(s,p,l,g){g===void 0&&(g=1);try{var h=s.db.transaction(s.storeName,p);l(null,h)}catch(m){if(g>0&&(!s.db||m.name==="InvalidStateError"||m.name==="NotFoundError"))return f.resolve().then(function(){if(!s.db||m.name==="NotFoundError"&&!s.db.objectStoreNames.contains(s.storeName)&&s.version<=s.db.version)return s.db&&(s.version=s.db.version+1),kt(s)}).then(function(){return er(s).then(function(){Ie(s,p,l,g-1)})}).catch(l);l(m)}}function Ii(){return{forages:[],db:null,dbReady:null,deferredOperations:[]}}function tr(s){var p=this,l={db:null};if(s)for(var g in s)l[g]=s[g];var h=O[l.name];h||(h=Ii(),O[l.name]=h),h.forages.push(p),p._initReady||(p._initReady=p.ready,p.ready=Xa);var m=[];function _(){return f.resolve()}for(var w=0;w<h.forages.length;w++){var x=h.forages[w];x!==p&&m.push(x._initReady().catch(_))}var k=h.forages.slice(0);return f.all(m).then(function(){return l.db=h.db,je(l)}).then(function(C){return l.db=C,Wt(l,p._defaultConfig.version)?kt(l):C}).then(function(C){l.db=h.db=C,p._dbInfo=l;for(var I=0;I<k.length;I++){var U=k[I];U!==p&&(U._dbInfo.db=l.db,U._dbInfo.version=l.version)}})}function nr(s,p){var l=this;s=T(s);var g=new f(function(h,m){l.ready().then(function(){Ie(l._dbInfo,Q,function(_,w){if(_)return m(_);try{var x=w.objectStore(l._dbInfo.storeName),k=x.get(s);k.onsuccess=function(){var C=k.result;C===void 0&&(C=null),ji(C)&&(C=st(C)),h(C)},k.onerror=function(){m(k.error)}}catch(C){m(C)}})}).catch(m)});return y(g,p),g}function ir(s,p){var l=this,g=new f(function(h,m){l.ready().then(function(){Ie(l._dbInfo,Q,function(_,w){if(_)return m(_);try{var x=w.objectStore(l._dbInfo.storeName),k=x.openCursor(),C=1;k.onsuccess=function(){var I=k.result;if(I){var U=I.value;ji(U)&&(U=st(U));var Y=s(U,I.key,C++);Y!==void 0?h(Y):I.continue()}else h()},k.onerror=function(){m(k.error)}}catch(I){m(I)}})}).catch(m)});return y(g,p),g}function or(s,p,l){var g=this;s=T(s);var h=new f(function(m,_){var w;g.ready().then(function(){return w=g._dbInfo,Z.call(p)==="[object Blob]"?J(w.db).then(function(x){return x?p:jn(p)}):p}).then(function(x){Ie(g._dbInfo,S,function(k,C){if(k)return _(k);try{var I=C.objectStore(g._dbInfo.storeName);x===null&&(x=void 0);var U=I.put(x,s);C.oncomplete=function(){x===void 0&&(x=null),m(x)},C.onabort=C.onerror=function(){var Y=U.error?U.error:U.transaction.error;_(Y)}}catch(Y){_(Y)}})}).catch(_)});return y(h,l),h}function ar(s,p){var l=this;s=T(s);var g=new f(function(h,m){l.ready().then(function(){Ie(l._dbInfo,S,function(_,w){if(_)return m(_);try{var x=w.objectStore(l._dbInfo.storeName),k=x.delete(s);w.oncomplete=function(){h()},w.onerror=function(){m(k.error)},w.onabort=function(){var C=k.error?k.error:k.transaction.error;m(C)}}catch(C){m(C)}})}).catch(m)});return y(g,p),g}function rr(s){var p=this,l=new f(function(g,h){p.ready().then(function(){Ie(p._dbInfo,S,function(m,_){if(m)return h(m);try{var w=_.objectStore(p._dbInfo.storeName),x=w.clear();_.oncomplete=function(){g()},_.onabort=_.onerror=function(){var k=x.error?x.error:x.transaction.error;h(k)}}catch(k){h(k)}})}).catch(h)});return y(l,s),l}function sr(s){var p=this,l=new f(function(g,h){p.ready().then(function(){Ie(p._dbInfo,Q,function(m,_){if(m)return h(m);try{var w=_.objectStore(p._dbInfo.storeName),x=w.count();x.onsuccess=function(){g(x.result)},x.onerror=function(){h(x.error)}}catch(k){h(k)}})}).catch(h)});return y(l,s),l}function cr(s,p){var l=this,g=new f(function(h,m){if(s<0){h(null);return}l.ready().then(function(){Ie(l._dbInfo,Q,function(_,w){if(_)return m(_);try{var x=w.objectStore(l._dbInfo.storeName),k=!1,C=x.openKeyCursor();C.onsuccess=function(){var I=C.result;if(!I){h(null);return}s===0||k?h(I.key):(k=!0,I.advance(s))},C.onerror=function(){m(C.error)}}catch(I){m(I)}})}).catch(m)});return y(g,p),g}function lr(s){var p=this,l=new f(function(g,h){p.ready().then(function(){Ie(p._dbInfo,Q,function(m,_){if(m)return h(m);try{var w=_.objectStore(p._dbInfo.storeName),x=w.openKeyCursor(),k=[];x.onsuccess=function(){var C=x.result;if(!C){g(k);return}k.push(C.key),C.continue()},x.onerror=function(){h(x.error)}}catch(C){h(C)}})}).catch(h)});return y(l,s),l}function dr(s,p){p=L.apply(this,arguments);var l=this.config();s=typeof s!="function"&&s||{},s.name||(s.name=s.name||l.name,s.storeName=s.storeName||l.storeName);var g=this,h;if(!s.name)h=f.reject("Invalid arguments");else{var m=s.name===l.name&&g._dbInfo.db,_=m?f.resolve(g._dbInfo.db):je(s).then(function(w){var x=O[s.name],k=x.forages;x.db=w;for(var C=0;C<k.length;C++)k[C]._dbInfo.db=w;return w});s.storeName?h=_.then(function(w){if(w.objectStoreNames.contains(s.storeName)){var x=w.version+1;pe(s);var k=O[s.name],C=k.forages;w.close();for(var I=0;I<C.length;I++){var U=C[I];U._dbInfo.db=null,U._dbInfo.version=x}var Y=new f(function(K,se){var oe=d.open(s.name,x);oe.onerror=function(xe){var St=oe.result;St.close(),se(xe)},oe.onupgradeneeded=function(){var xe=oe.result;xe.deleteObjectStore(s.storeName)},oe.onsuccess=function(){var xe=oe.result;xe.close(),K(xe)}});return Y.then(function(K){k.db=K;for(var se=0;se<C.length;se++){var oe=C[se];oe._dbInfo.db=K,ye(oe._dbInfo)}}).catch(function(K){throw(we(s,K)||f.resolve()).catch(function(){}),K})}}):h=_.then(function(w){pe(s);var x=O[s.name],k=x.forages;w.close();for(var C=0;C<k.length;C++){var I=k[C];I._dbInfo.db=null}var U=new f(function(Y,K){var se=d.deleteDatabase(s.name);se.onerror=function(){var oe=se.result;oe&&oe.close(),K(se.error)},se.onblocked=function(){},se.onsuccess=function(){var oe=se.result;oe&&oe.close(),Y(oe)}});return U.then(function(Y){x.db=Y;for(var K=0;K<k.length;K++){var se=k[K];ye(se._dbInfo)}}).catch(function(Y){throw(we(s,Y)||f.resolve()).catch(function(){}),Y})})}return y(h,p),h}var ur={_driver:"asyncStorage",_initStorage:tr,_support:u(),iterate:ir,getItem:nr,setItem:or,removeItem:ar,clear:rr,length:sr,key:cr,keys:lr,dropInstance:dr};function pr(){return typeof openDatabase=="function"}var Be="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",mr="~~local_forage_type~",zi=/^~~local_forage_type~([^~]+)~/,Vt="__lfsc__:",In=Vt.length,zn="arbf",Pn="blob",Pi="si08",Ri="ui08",Di="uic8",Oi="si16",Ni="si32",Bi="ur16",Li="ui32",Zi="fl32",Fi="fl64",qi=In+zn.length,Ui=Object.prototype.toString;function Hi(s){var p=s.length*.75,l=s.length,g,h=0,m,_,w,x;s[s.length-1]==="="&&(p--,s[s.length-2]==="="&&p--);var k=new ArrayBuffer(p),C=new Uint8Array(k);for(g=0;g<l;g+=4)m=Be.indexOf(s[g]),_=Be.indexOf(s[g+1]),w=Be.indexOf(s[g+2]),x=Be.indexOf(s[g+3]),C[h++]=m<<2|_>>4,C[h++]=(_&15)<<4|w>>2,C[h++]=(w&3)<<6|x&63;return k}function Rn(s){var p=new Uint8Array(s),l="",g;for(g=0;g<p.length;g+=3)l+=Be[p[g]>>2],l+=Be[(p[g]&3)<<4|p[g+1]>>4],l+=Be[(p[g+1]&15)<<2|p[g+2]>>6],l+=Be[p[g+2]&63];return p.length%3===2?l=l.substring(0,l.length-1)+"=":p.length%3===1&&(l=l.substring(0,l.length-2)+"=="),l}function fr(s,p){var l="";if(s&&(l=Ui.call(s)),s&&(l==="[object ArrayBuffer]"||s.buffer&&Ui.call(s.buffer)==="[object ArrayBuffer]")){var g,h=Vt;s instanceof ArrayBuffer?(g=s,h+=zn):(g=s.buffer,l==="[object Int8Array]"?h+=Pi:l==="[object Uint8Array]"?h+=Ri:l==="[object Uint8ClampedArray]"?h+=Di:l==="[object Int16Array]"?h+=Oi:l==="[object Uint16Array]"?h+=Bi:l==="[object Int32Array]"?h+=Ni:l==="[object Uint32Array]"?h+=Li:l==="[object Float32Array]"?h+=Zi:l==="[object Float64Array]"?h+=Fi:p(new Error("Failed to get type for BinaryArray"))),p(h+Rn(g))}else if(l==="[object Blob]"){var m=new FileReader;m.onload=function(){var _=mr+s.type+"~"+Rn(this.result);p(Vt+Pn+_)},m.readAsArrayBuffer(s)}else try{p(JSON.stringify(s))}catch(_){p(null,_)}}function gr(s){if(s.substring(0,In)!==Vt)return JSON.parse(s);var p=s.substring(qi),l=s.substring(In,qi),g;if(l===Pn&&zi.test(p)){var h=p.match(zi);g=h[1],p=p.substring(h[0].length)}var m=Hi(p);switch(l){case zn:return m;case Pn:return v([m],{type:g});case Pi:return new Int8Array(m);case Ri:return new Uint8Array(m);case Di:return new Uint8ClampedArray(m);case Oi:return new Int16Array(m);case Bi:return new Uint16Array(m);case Ni:return new Int32Array(m);case Li:return new Uint32Array(m);case Zi:return new Float32Array(m);case Fi:return new Float64Array(m);default:throw new Error("Unkown type: "+l)}}var Dn={serialize:fr,deserialize:gr,stringToBuffer:Hi,bufferToString:Rn};function Wi(s,p,l,g){s.executeSql("CREATE TABLE IF NOT EXISTS "+p.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],l,g)}function hr(s){var p=this,l={db:null};if(s)for(var g in s)l[g]=typeof s[g]!="string"?s[g].toString():s[g];var h=new f(function(m,_){try{l.db=openDatabase(l.name,String(l.version),l.description,l.size)}catch(w){return _(w)}l.db.transaction(function(w){Wi(w,l,function(){p._dbInfo=l,m()},function(x,k){_(k)})},_)});return l.serializer=Dn,h}function Le(s,p,l,g,h,m){s.executeSql(l,g,h,function(_,w){w.code===w.SYNTAX_ERR?_.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?",[p.storeName],function(x,k){k.rows.length?m(x,w):Wi(x,p,function(){x.executeSql(l,g,h,m)},m)},m):m(_,w)},m)}function vr(s,p){var l=this;s=T(s);var g=new f(function(h,m){l.ready().then(function(){var _=l._dbInfo;_.db.transaction(function(w){Le(w,_,"SELECT * FROM "+_.storeName+" WHERE key = ? LIMIT 1",[s],function(x,k){var C=k.rows.length?k.rows.item(0).value:null;C&&(C=_.serializer.deserialize(C)),h(C)},function(x,k){m(k)})})}).catch(m)});return y(g,p),g}function yr(s,p){var l=this,g=new f(function(h,m){l.ready().then(function(){var _=l._dbInfo;_.db.transaction(function(w){Le(w,_,"SELECT * FROM "+_.storeName,[],function(x,k){for(var C=k.rows,I=C.length,U=0;U<I;U++){var Y=C.item(U),K=Y.value;if(K&&(K=_.serializer.deserialize(K)),K=s(K,Y.key,U+1),K!==void 0){h(K);return}}h()},function(x,k){m(k)})})}).catch(m)});return y(g,p),g}function Vi(s,p,l,g){var h=this;s=T(s);var m=new f(function(_,w){h.ready().then(function(){p===void 0&&(p=null);var x=p,k=h._dbInfo;k.serializer.serialize(p,function(C,I){I?w(I):k.db.transaction(function(U){Le(U,k,"INSERT OR REPLACE INTO "+k.storeName+" (key, value) VALUES (?, ?)",[s,C],function(){_(x)},function(Y,K){w(K)})},function(U){if(U.code===U.QUOTA_ERR){if(g>0){_(Vi.apply(h,[s,x,l,g-1]));return}w(U)}})})}).catch(w)});return y(m,l),m}function br(s,p,l){return Vi.apply(this,[s,p,l,1])}function _r(s,p){var l=this;s=T(s);var g=new f(function(h,m){l.ready().then(function(){var _=l._dbInfo;_.db.transaction(function(w){Le(w,_,"DELETE FROM "+_.storeName+" WHERE key = ?",[s],function(){h()},function(x,k){m(k)})})}).catch(m)});return y(g,p),g}function wr(s){var p=this,l=new f(function(g,h){p.ready().then(function(){var m=p._dbInfo;m.db.transaction(function(_){Le(_,m,"DELETE FROM "+m.storeName,[],function(){g()},function(w,x){h(x)})})}).catch(h)});return y(l,s),l}function $r(s){var p=this,l=new f(function(g,h){p.ready().then(function(){var m=p._dbInfo;m.db.transaction(function(_){Le(_,m,"SELECT COUNT(key) as c FROM "+m.storeName,[],function(w,x){var k=x.rows.item(0).c;g(k)},function(w,x){h(x)})})}).catch(h)});return y(l,s),l}function xr(s,p){var l=this,g=new f(function(h,m){l.ready().then(function(){var _=l._dbInfo;_.db.transaction(function(w){Le(w,_,"SELECT key FROM "+_.storeName+" WHERE id = ? LIMIT 1",[s+1],function(x,k){var C=k.rows.length?k.rows.item(0).key:null;h(C)},function(x,k){m(k)})})}).catch(m)});return y(g,p),g}function kr(s){var p=this,l=new f(function(g,h){p.ready().then(function(){var m=p._dbInfo;m.db.transaction(function(_){Le(_,m,"SELECT key FROM "+m.storeName,[],function(w,x){for(var k=[],C=0;C<x.rows.length;C++)k.push(x.rows.item(C).key);g(k)},function(w,x){h(x)})})}).catch(h)});return y(l,s),l}function Cr(s){return new f(function(p,l){s.transaction(function(g){g.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],function(h,m){for(var _=[],w=0;w<m.rows.length;w++)_.push(m.rows.item(w).name);p({db:s,storeNames:_})},function(h,m){l(m)})},function(g){l(g)})})}function Sr(s,p){p=L.apply(this,arguments);var l=this.config();s=typeof s!="function"&&s||{},s.name||(s.name=s.name||l.name,s.storeName=s.storeName||l.storeName);var g=this,h;return s.name?h=new f(function(m){var _;s.name===l.name?_=g._dbInfo.db:_=openDatabase(s.name,"","",0),s.storeName?m({db:_,storeNames:[s.storeName]}):m(Cr(_))}).then(function(m){return new f(function(_,w){m.db.transaction(function(x){function k(Y){return new f(function(K,se){x.executeSql("DROP TABLE IF EXISTS "+Y,[],function(){K()},function(oe,xe){se(xe)})})}for(var C=[],I=0,U=m.storeNames.length;I<U;I++)C.push(k(m.storeNames[I]));f.all(C).then(function(){_()}).catch(function(Y){w(Y)})},function(x){w(x)})})}):h=f.reject("Invalid arguments"),y(h,p),h}var Tr={_driver:"webSQLStorage",_initStorage:hr,_support:pr(),iterate:yr,getItem:vr,setItem:br,removeItem:_r,clear:wr,length:$r,key:xr,keys:kr,dropInstance:Sr};function Er(){try{return typeof localStorage<"u"&&"setItem"in localStorage&&!!localStorage.setItem}catch{return!1}}function Gi(s,p){var l=s.name+"/";return s.storeName!==p.storeName&&(l+=s.storeName+"/"),l}function Ar(){var s="_localforage_support_test";try{return localStorage.setItem(s,!0),localStorage.removeItem(s),!1}catch{return!0}}function Mr(){return!Ar()||localStorage.length>0}function jr(s){var p=this,l={};if(s)for(var g in s)l[g]=s[g];return l.keyPrefix=Gi(s,p._defaultConfig),Mr()?(p._dbInfo=l,l.serializer=Dn,f.resolve()):f.reject()}function Ir(s){var p=this,l=p.ready().then(function(){for(var g=p._dbInfo.keyPrefix,h=localStorage.length-1;h>=0;h--){var m=localStorage.key(h);m.indexOf(g)===0&&localStorage.removeItem(m)}});return y(l,s),l}function zr(s,p){var l=this;s=T(s);var g=l.ready().then(function(){var h=l._dbInfo,m=localStorage.getItem(h.keyPrefix+s);return m&&(m=h.serializer.deserialize(m)),m});return y(g,p),g}function Pr(s,p){var l=this,g=l.ready().then(function(){for(var h=l._dbInfo,m=h.keyPrefix,_=m.length,w=localStorage.length,x=1,k=0;k<w;k++){var C=localStorage.key(k);if(C.indexOf(m)===0){var I=localStorage.getItem(C);if(I&&(I=h.serializer.deserialize(I)),I=s(I,C.substring(_),x++),I!==void 0)return I}}});return y(g,p),g}function Rr(s,p){var l=this,g=l.ready().then(function(){var h=l._dbInfo,m;try{m=localStorage.key(s)}catch{m=null}return m&&(m=m.substring(h.keyPrefix.length)),m});return y(g,p),g}function Dr(s){var p=this,l=p.ready().then(function(){for(var g=p._dbInfo,h=localStorage.length,m=[],_=0;_<h;_++){var w=localStorage.key(_);w.indexOf(g.keyPrefix)===0&&m.push(w.substring(g.keyPrefix.length))}return m});return y(l,s),l}function Or(s){var p=this,l=p.keys().then(function(g){return g.length});return y(l,s),l}function Nr(s,p){var l=this;s=T(s);var g=l.ready().then(function(){var h=l._dbInfo;localStorage.removeItem(h.keyPrefix+s)});return y(g,p),g}function Br(s,p,l){var g=this;s=T(s);var h=g.ready().then(function(){p===void 0&&(p=null);var m=p;return new f(function(_,w){var x=g._dbInfo;x.serializer.serialize(p,function(k,C){if(C)w(C);else try{localStorage.setItem(x.keyPrefix+s,k),_(m)}catch(I){(I.name==="QuotaExceededError"||I.name==="NS_ERROR_DOM_QUOTA_REACHED")&&w(I),w(I)}})})});return y(h,l),h}function Lr(s,p){if(p=L.apply(this,arguments),s=typeof s!="function"&&s||{},!s.name){var l=this.config();s.name=s.name||l.name,s.storeName=s.storeName||l.storeName}var g=this,h;return s.name?h=new f(function(m){s.storeName?m(Gi(s,g._defaultConfig)):m(s.name+"/")}).then(function(m){for(var _=localStorage.length-1;_>=0;_--){var w=localStorage.key(_);w.indexOf(m)===0&&localStorage.removeItem(w)}}):h=f.reject("Invalid arguments"),y(h,p),h}var Zr={_driver:"localStorageWrapper",_initStorage:jr,_support:Er(),iterate:Pr,getItem:zr,setItem:Br,removeItem:Nr,clear:Ir,length:Or,key:Rr,keys:Dr,dropInstance:Lr},Fr=function(p,l){return p===l||typeof p=="number"&&typeof l=="number"&&isNaN(p)&&isNaN(l)},qr=function(p,l){for(var g=p.length,h=0;h<g;){if(Fr(p[h],l))return!0;h++}return!1},Yi=Array.isArray||function(s){return Object.prototype.toString.call(s)==="[object Array]"},Ct={},Ki={},ct={INDEXEDDB:ur,WEBSQL:Tr,LOCALSTORAGE:Zr},Ur=[ct.INDEXEDDB._driver,ct.WEBSQL._driver,ct.LOCALSTORAGE._driver],Gt=["dropInstance"],On=["clear","getItem","iterate","key","keys","length","removeItem","setItem"].concat(Gt),Hr={description:"",driver:Ur.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1};function Wr(s,p){s[p]=function(){var l=arguments;return s.ready().then(function(){return s[p].apply(s,l)})}}function Nn(){for(var s=1;s<arguments.length;s++){var p=arguments[s];if(p)for(var l in p)p.hasOwnProperty(l)&&(Yi(p[l])?arguments[0][l]=p[l].slice():arguments[0][l]=p[l])}return arguments[0]}var Vr=(function(){function s(p){r(this,s);for(var l in ct)if(ct.hasOwnProperty(l)){var g=ct[l],h=g._driver;this[l]=h,Ct[h]||this.defineDriver(g)}this._defaultConfig=Nn({},Hr),this._config=Nn({},this._defaultConfig,p),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch(function(){})}return s.prototype.config=function(l){if((typeof l>"u"?"undefined":a(l))==="object"){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var g in l){if(g==="storeName"&&(l[g]=l[g].replace(/\W/g,"_")),g==="version"&&typeof l[g]!="number")return new Error("Database version must be a number.");this._config[g]=l[g]}return"driver"in l&&l.driver?this.setDriver(this._config.driver):!0}else return typeof l=="string"?this._config[l]:this._config},s.prototype.defineDriver=function(l,g,h){var m=new f(function(_,w){try{var x=l._driver,k=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!l._driver){w(k);return}for(var C=On.concat("_initStorage"),I=0,U=C.length;I<U;I++){var Y=C[I],K=!qr(Gt,Y);if((K||l[Y])&&typeof l[Y]!="function"){w(k);return}}var se=function(){for(var St=function(Kr){return function(){var Qr=new Error("Method "+Kr+" is not implemented by the current driver"),Qi=f.reject(Qr);return y(Qi,arguments[arguments.length-1]),Qi}},Bn=0,Yr=Gt.length;Bn<Yr;Bn++){var Ln=Gt[Bn];l[Ln]||(l[Ln]=St(Ln))}};se();var oe=function(St){Ct[x],Ct[x]=l,Ki[x]=St,_()};"_support"in l?l._support&&typeof l._support=="function"?l._support().then(oe,w):oe(!!l._support):oe(!0)}catch(xe){w(xe)}});return $(m,g,h),m},s.prototype.driver=function(){return this._driver||null},s.prototype.getDriver=function(l,g,h){var m=Ct[l]?f.resolve(Ct[l]):f.reject(new Error("Driver not found."));return $(m,g,h),m},s.prototype.getSerializer=function(l){var g=f.resolve(Dn);return $(g,l),g},s.prototype.ready=function(l){var g=this,h=g._driverSet.then(function(){return g._ready===null&&(g._ready=g._initDriver()),g._ready});return $(h,l,l),h},s.prototype.setDriver=function(l,g,h){var m=this;Yi(l)||(l=[l]);var _=this._getSupportedDrivers(l);function w(){m._config.driver=m.driver()}function x(I){return m._extend(I),w(),m._ready=m._initStorage(m._config),m._ready}function k(I){return function(){var U=0;function Y(){for(;U<I.length;){var K=I[U];return U++,m._dbInfo=null,m._ready=null,m.getDriver(K).then(x).catch(Y)}w();var se=new Error("No available storage method found.");return m._driverSet=f.reject(se),m._driverSet}return Y()}}var C=this._driverSet!==null?this._driverSet.catch(function(){return f.resolve()}):f.resolve();return this._driverSet=C.then(function(){var I=_[0];return m._dbInfo=null,m._ready=null,m.getDriver(I).then(function(U){m._driver=U._driver,w(),m._wrapLibraryMethodsWithReady(),m._initDriver=k(_)})}).catch(function(){w();var I=new Error("No available storage method found.");return m._driverSet=f.reject(I),m._driverSet}),$(this._driverSet,g,h),this._driverSet},s.prototype.supports=function(l){return!!Ki[l]},s.prototype._extend=function(l){Nn(this,l)},s.prototype._getSupportedDrivers=function(l){for(var g=[],h=0,m=l.length;h<m;h++){var _=l[h];this.supports(_)&&g.push(_)}return g},s.prototype._wrapLibraryMethodsWithReady=function(){for(var l=0,g=On.length;l<g;l++)Wr(this,On[l])},s.prototype.createInstance=function(l){return new s(l)},s})(),Gr=new Vr;i.exports=Gr},{3:3}]},{},[4])(4)})})(Zn)),Zn.exports}var vs=hs();const Qt=gs(vs);function b(e,t,n){function i(c,d){var u;Object.defineProperty(c,"_zod",{value:c._zod??{},enumerable:!1}),(u=c._zod).traits??(u.traits=new Set),c._zod.traits.add(e),t(c,d);for(const v in r.prototype)v in c||Object.defineProperty(c,v,{value:r.prototype[v].bind(c)});c._zod.constr=r,c._zod.def=d}const o=n?.Parent??Object;class a extends o{}Object.defineProperty(a,"name",{value:e});function r(c){var d;const u=n?.Parent?new a:this;i(u,c),(d=u._zod).deferred??(d.deferred=[]);for(const v of u._zod.deferred)v();return u}return Object.defineProperty(r,"init",{value:i}),Object.defineProperty(r,Symbol.hasInstance,{value:c=>n?.Parent&&c instanceof n.Parent?!0:c?._zod?.traits?.has(e)}),Object.defineProperty(r,"name",{value:e}),r}class ft extends Error{constructor(){super("Encountered Promise during synchronous parse. Use .parseAsync() instead.")}}class Fo extends Error{constructor(t){super(`Encountered unidirectional transform during encode: ${t}`),this.name="ZodEncodeError"}}const qo={};function Xe(e){return qo}function ys(e){const t=Object.values(e).filter(i=>typeof i=="number");return Object.entries(e).filter(([i,o])=>t.indexOf(+i)===-1).map(([i,o])=>o)}function Kn(e,t){return typeof t=="bigint"?t.toString():t}function ci(e){return{get value(){{const t=e();return Object.defineProperty(this,"value",{value:t}),t}}}}function li(e){return e==null}function di(e){const t=e.startsWith("^")?1:0,n=e.endsWith("$")?e.length-1:e.length;return e.slice(t,n)}function bs(e,t){const n=(e.toString().split(".")[1]||"").length,i=t.toString();let o=(i.split(".")[1]||"").length;if(o===0&&/\d?e-\d?/.test(i)){const d=i.match(/\d?e-(\d?)/);d?.[1]&&(o=Number.parseInt(d[1]))}const a=n>o?n:o,r=Number.parseInt(e.toFixed(a).replace(".","")),c=Number.parseInt(t.toFixed(a).replace(".",""));return r%c/10**a}const no=Symbol("evaluating");function X(e,t,n){let i;Object.defineProperty(e,t,{get(){if(i!==no)return i===void 0&&(i=no,i=n()),i},set(o){Object.defineProperty(e,t,{value:o})},configurable:!0})}function at(e,t,n){Object.defineProperty(e,t,{value:n,writable:!0,enumerable:!0,configurable:!0})}function rt(...e){const t={};for(const n of e){const i=Object.getOwnPropertyDescriptors(n);Object.assign(t,i)}return Object.defineProperties({},t)}function io(e){return JSON.stringify(e)}const Uo="captureStackTrace"in Error?Error.captureStackTrace:(...e)=>{};function sn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const _s=ci(()=>{if(typeof navigator<"u"&&navigator?.userAgent?.includes("Cloudflare"))return!1;try{const e=Function;return new e(""),!0}catch{return!1}});function Rt(e){if(sn(e)===!1)return!1;const t=e.constructor;if(t===void 0)return!0;const n=t.prototype;return!(sn(n)===!1||Object.prototype.hasOwnProperty.call(n,"isPrototypeOf")===!1)}function Ho(e){return Rt(e)?{...e}:Array.isArray(e)?[...e]:e}const ws=new Set(["string","number","symbol"]);function ht(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Ve(e,t,n){const i=new e._zod.constr(t??e._zod.def);return(!t||n?.parent)&&(i._zod.parent=e),i}function P(e){const t=e;if(!t)return{};if(typeof t=="string")return{error:()=>t};if(t?.message!==void 0){if(t?.error!==void 0)throw new Error("Cannot specify both `message` and `error` params");t.error=t.message}return delete t.message,typeof t.error=="string"?{...t,error:()=>t.error}:t}function $s(e){return Object.keys(e).filter(t=>e[t]._zod.optin==="optional"&&e[t]._zod.optout==="optional")}const xs={safeint:[Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],int32:[-2147483648,2147483647],uint32:[0,4294967295],float32:[-34028234663852886e22,34028234663852886e22],float64:[-Number.MAX_VALUE,Number.MAX_VALUE]};function ks(e,t){const n=e._zod.def,i=rt(e._zod.def,{get shape(){const o={};for(const a in t){if(!(a in n.shape))throw new Error(`Unrecognized key: "${a}"`);t[a]&&(o[a]=n.shape[a])}return at(this,"shape",o),o},checks:[]});return Ve(e,i)}function Cs(e,t){const n=e._zod.def,i=rt(e._zod.def,{get shape(){const o={...e._zod.def.shape};for(const a in t){if(!(a in n.shape))throw new Error(`Unrecognized key: "${a}"`);t[a]&&delete o[a]}return at(this,"shape",o),o},checks:[]});return Ve(e,i)}function Ss(e,t){if(!Rt(t))throw new Error("Invalid input to extend: expected a plain object");const n=e._zod.def.checks;if(n&&n.length>0)throw new Error("Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.");const o=rt(e._zod.def,{get shape(){const a={...e._zod.def.shape,...t};return at(this,"shape",a),a},checks:[]});return Ve(e,o)}function Ts(e,t){if(!Rt(t))throw new Error("Invalid input to safeExtend: expected a plain object");const n={...e._zod.def,get shape(){const i={...e._zod.def.shape,...t};return at(this,"shape",i),i},checks:e._zod.def.checks};return Ve(e,n)}function Es(e,t){const n=rt(e._zod.def,{get shape(){const i={...e._zod.def.shape,...t._zod.def.shape};return at(this,"shape",i),i},get catchall(){return t._zod.def.catchall},checks:[]});return Ve(e,n)}function As(e,t,n){const i=rt(t._zod.def,{get shape(){const o=t._zod.def.shape,a={...o};if(n)for(const r in n){if(!(r in o))throw new Error(`Unrecognized key: "${r}"`);n[r]&&(a[r]=e?new e({type:"optional",innerType:o[r]}):o[r])}else for(const r in o)a[r]=e?new e({type:"optional",innerType:o[r]}):o[r];return at(this,"shape",a),a},checks:[]});return Ve(t,i)}function Ms(e,t,n){const i=rt(t._zod.def,{get shape(){const o=t._zod.def.shape,a={...o};if(n)for(const r in n){if(!(r in a))throw new Error(`Unrecognized key: "${r}"`);n[r]&&(a[r]=new e({type:"nonoptional",innerType:o[r]}))}else for(const r in o)a[r]=new e({type:"nonoptional",innerType:o[r]});return at(this,"shape",a),a},checks:[]});return Ve(t,i)}function pt(e,t=0){if(e.aborted===!0)return!0;for(let n=t;n<e.issues.length;n++)if(e.issues[n]?.continue!==!0)return!0;return!1}function Wo(e,t){return t.map(n=>{var i;return(i=n).path??(i.path=[]),n.path.unshift(e),n})}function Jt(e){return typeof e=="string"?e:e?.message}function et(e,t,n){const i={...e,path:e.path??[]};if(!e.message){const o=Jt(e.inst?._zod.def?.error?.(e))??Jt(t?.error?.(e))??Jt(n.customError?.(e))??Jt(n.localeError?.(e))??"Invalid input";i.message=o}return delete i.inst,delete i.continue,t?.reportInput||delete i.input,i}function ui(e){return Array.isArray(e)?"array":typeof e=="string"?"string":"unknown"}function Dt(...e){const[t,n,i]=e;return typeof t=="string"?{message:t,code:"custom",input:n,inst:i}:{...t}}const Vo=(e,t)=>{e.name="$ZodError",Object.defineProperty(e,"_zod",{value:e._zod,enumerable:!1}),Object.defineProperty(e,"issues",{value:t,enumerable:!1}),e.message=JSON.stringify(t,Kn,2),Object.defineProperty(e,"toString",{value:()=>e.message,enumerable:!1})},Go=b("$ZodError",Vo),Yo=b("$ZodError",Vo,{Parent:Error});function js(e,t=n=>n.message){const n={},i=[];for(const o of e.issues)o.path.length>0?(n[o.path[0]]=n[o.path[0]]||[],n[o.path[0]].push(t(o))):i.push(t(o));return{formErrors:i,fieldErrors:n}}function Is(e,t=n=>n.message){const n={_errors:[]},i=o=>{for(const a of o.issues)if(a.code==="invalid_union"&&a.errors.length)a.errors.map(r=>i({issues:r}));else if(a.code==="invalid_key")i({issues:a.issues});else if(a.code==="invalid_element")i({issues:a.issues});else if(a.path.length===0)n._errors.push(t(a));else{let r=n,c=0;for(;c<a.path.length;){const d=a.path[c];c===a.path.length-1?(r[d]=r[d]||{_errors:[]},r[d]._errors.push(t(a))):r[d]=r[d]||{_errors:[]},r=r[d],c++}}};return i(e),n}const pi=e=>(t,n,i,o)=>{const a=i?Object.assign(i,{async:!1}):{async:!1},r=t._zod.run({value:n,issues:[]},a);if(r instanceof Promise)throw new ft;if(r.issues.length){const c=new(o?.Err??e)(r.issues.map(d=>et(d,a,Xe())));throw Uo(c,o?.callee),c}return r.value},mi=e=>async(t,n,i,o)=>{const a=i?Object.assign(i,{async:!0}):{async:!0};let r=t._zod.run({value:n,issues:[]},a);if(r instanceof Promise&&(r=await r),r.issues.length){const c=new(o?.Err??e)(r.issues.map(d=>et(d,a,Xe())));throw Uo(c,o?.callee),c}return r.value},xn=e=>(t,n,i)=>{const o=i?{...i,async:!1}:{async:!1},a=t._zod.run({value:n,issues:[]},o);if(a instanceof Promise)throw new ft;return a.issues.length?{success:!1,error:new(e??Go)(a.issues.map(r=>et(r,o,Xe())))}:{success:!0,data:a.value}},zs=xn(Yo),kn=e=>async(t,n,i)=>{const o=i?Object.assign(i,{async:!0}):{async:!0};let a=t._zod.run({value:n,issues:[]},o);return a instanceof Promise&&(a=await a),a.issues.length?{success:!1,error:new e(a.issues.map(r=>et(r,o,Xe())))}:{success:!0,data:a.value}},Ps=kn(Yo),Rs=e=>(t,n,i)=>{const o=i?Object.assign(i,{direction:"backward"}):{direction:"backward"};return pi(e)(t,n,o)},Ds=e=>(t,n,i)=>pi(e)(t,n,i),Os=e=>async(t,n,i)=>{const o=i?Object.assign(i,{direction:"backward"}):{direction:"backward"};return mi(e)(t,n,o)},Ns=e=>async(t,n,i)=>mi(e)(t,n,i),Bs=e=>(t,n,i)=>{const o=i?Object.assign(i,{direction:"backward"}):{direction:"backward"};return xn(e)(t,n,o)},Ls=e=>(t,n,i)=>xn(e)(t,n,i),Zs=e=>async(t,n,i)=>{const o=i?Object.assign(i,{direction:"backward"}):{direction:"backward"};return kn(e)(t,n,o)},Fs=e=>async(t,n,i)=>kn(e)(t,n,i),qs=/^[cC][^\s-]{8,}$/,Us=/^[0-9a-z]+$/,Hs=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,Ws=/^[0-9a-vA-V]{20}$/,Vs=/^[A-Za-z0-9]{27}$/,Gs=/^[a-zA-Z0-9_-]{21}$/,Ys=/^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,Ks=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,oo=e=>e?new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`):/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,Qs=/^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,Js="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";function Xs(){return new RegExp(Js,"u")}const ec=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,tc=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,nc=/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,ic=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,oc=/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,Ko=/^[A-Za-z0-9_-]*$/,ac=/^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/,rc=/^\+(?:[0-9]){6,14}[0-9]$/,Qo="(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",sc=new RegExp(`^${Qo}$`);function Jo(e){const t="(?:[01]\\d|2[0-3]):[0-5]\\d";return typeof e.precision=="number"?e.precision===-1?`${t}`:e.precision===0?`${t}:[0-5]\\d`:`${t}:[0-5]\\d\\.\\d{${e.precision}}`:`${t}(?::[0-5]\\d(?:\\.\\d+)?)?`}function cc(e){return new RegExp(`^${Jo(e)}$`)}function lc(e){const t=Jo({precision:e.precision}),n=["Z"];e.local&&n.push(""),e.offset&&n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");const i=`${t}(?:${n.join("|")})`;return new RegExp(`^${Qo}T(?:${i})$`)}const dc=e=>{const t=e?`[\\s\\S]{${e?.minimum??0},${e?.maximum??""}}`:"[\\s\\S]*";return new RegExp(`^${t}$`)},uc=/^-?\d+$/,pc=/^-?\d+(?:\.\d+)?/,mc=/^(?:true|false)$/i,fc=/^[^A-Z]*$/,gc=/^[^a-z]*$/,ge=b("$ZodCheck",(e,t)=>{var n;e._zod??(e._zod={}),e._zod.def=t,(n=e._zod).onattach??(n.onattach=[])}),Xo={number:"number",bigint:"bigint",object:"date"},ea=b("$ZodCheckLessThan",(e,t)=>{ge.init(e,t);const n=Xo[typeof t.value];e._zod.onattach.push(i=>{const o=i._zod.bag,a=(t.inclusive?o.maximum:o.exclusiveMaximum)??Number.POSITIVE_INFINITY;t.value<a&&(t.inclusive?o.maximum=t.value:o.exclusiveMaximum=t.value)}),e._zod.check=i=>{(t.inclusive?i.value<=t.value:i.value<t.value)||i.issues.push({origin:n,code:"too_big",maximum:t.value,input:i.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),ta=b("$ZodCheckGreaterThan",(e,t)=>{ge.init(e,t);const n=Xo[typeof t.value];e._zod.onattach.push(i=>{const o=i._zod.bag,a=(t.inclusive?o.minimum:o.exclusiveMinimum)??Number.NEGATIVE_INFINITY;t.value>a&&(t.inclusive?o.minimum=t.value:o.exclusiveMinimum=t.value)}),e._zod.check=i=>{(t.inclusive?i.value>=t.value:i.value>t.value)||i.issues.push({origin:n,code:"too_small",minimum:t.value,input:i.value,inclusive:t.inclusive,inst:e,continue:!t.abort})}}),hc=b("$ZodCheckMultipleOf",(e,t)=>{ge.init(e,t),e._zod.onattach.push(n=>{var i;(i=n._zod.bag).multipleOf??(i.multipleOf=t.value)}),e._zod.check=n=>{if(typeof n.value!=typeof t.value)throw new Error("Cannot mix number and bigint in multiple_of check.");(typeof n.value=="bigint"?n.value%t.value===BigInt(0):bs(n.value,t.value)===0)||n.issues.push({origin:typeof n.value,code:"not_multiple_of",divisor:t.value,input:n.value,inst:e,continue:!t.abort})}}),vc=b("$ZodCheckNumberFormat",(e,t)=>{ge.init(e,t),t.format=t.format||"float64";const n=t.format?.includes("int"),i=n?"int":"number",[o,a]=xs[t.format];e._zod.onattach.push(r=>{const c=r._zod.bag;c.format=t.format,c.minimum=o,c.maximum=a,n&&(c.pattern=uc)}),e._zod.check=r=>{const c=r.value;if(n){if(!Number.isInteger(c)){r.issues.push({expected:i,format:t.format,code:"invalid_type",continue:!1,input:c,inst:e});return}if(!Number.isSafeInteger(c)){c>0?r.issues.push({input:c,code:"too_big",maximum:Number.MAX_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst:e,origin:i,continue:!t.abort}):r.issues.push({input:c,code:"too_small",minimum:Number.MIN_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst:e,origin:i,continue:!t.abort});return}}c<o&&r.issues.push({origin:"number",input:c,code:"too_small",minimum:o,inclusive:!0,inst:e,continue:!t.abort}),c>a&&r.issues.push({origin:"number",input:c,code:"too_big",maximum:a,inst:e})}}),yc=b("$ZodCheckMaxLength",(e,t)=>{var n;ge.init(e,t),(n=e._zod.def).when??(n.when=i=>{const o=i.value;return!li(o)&&o.length!==void 0}),e._zod.onattach.push(i=>{const o=i._zod.bag.maximum??Number.POSITIVE_INFINITY;t.maximum<o&&(i._zod.bag.maximum=t.maximum)}),e._zod.check=i=>{const o=i.value;if(o.length<=t.maximum)return;const r=ui(o);i.issues.push({origin:r,code:"too_big",maximum:t.maximum,inclusive:!0,input:o,inst:e,continue:!t.abort})}}),bc=b("$ZodCheckMinLength",(e,t)=>{var n;ge.init(e,t),(n=e._zod.def).when??(n.when=i=>{const o=i.value;return!li(o)&&o.length!==void 0}),e._zod.onattach.push(i=>{const o=i._zod.bag.minimum??Number.NEGATIVE_INFINITY;t.minimum>o&&(i._zod.bag.minimum=t.minimum)}),e._zod.check=i=>{const o=i.value;if(o.length>=t.minimum)return;const r=ui(o);i.issues.push({origin:r,code:"too_small",minimum:t.minimum,inclusive:!0,input:o,inst:e,continue:!t.abort})}}),_c=b("$ZodCheckLengthEquals",(e,t)=>{var n;ge.init(e,t),(n=e._zod.def).when??(n.when=i=>{const o=i.value;return!li(o)&&o.length!==void 0}),e._zod.onattach.push(i=>{const o=i._zod.bag;o.minimum=t.length,o.maximum=t.length,o.length=t.length}),e._zod.check=i=>{const o=i.value,a=o.length;if(a===t.length)return;const r=ui(o),c=a>t.length;i.issues.push({origin:r,...c?{code:"too_big",maximum:t.length}:{code:"too_small",minimum:t.length},inclusive:!0,exact:!0,input:i.value,inst:e,continue:!t.abort})}}),Cn=b("$ZodCheckStringFormat",(e,t)=>{var n,i;ge.init(e,t),e._zod.onattach.push(o=>{const a=o._zod.bag;a.format=t.format,t.pattern&&(a.patterns??(a.patterns=new Set),a.patterns.add(t.pattern))}),t.pattern?(n=e._zod).check??(n.check=o=>{t.pattern.lastIndex=0,!t.pattern.test(o.value)&&o.issues.push({origin:"string",code:"invalid_format",format:t.format,input:o.value,...t.pattern?{pattern:t.pattern.toString()}:{},inst:e,continue:!t.abort})}):(i=e._zod).check??(i.check=()=>{})}),wc=b("$ZodCheckRegex",(e,t)=>{Cn.init(e,t),e._zod.check=n=>{t.pattern.lastIndex=0,!t.pattern.test(n.value)&&n.issues.push({origin:"string",code:"invalid_format",format:"regex",input:n.value,pattern:t.pattern.toString(),inst:e,continue:!t.abort})}}),$c=b("$ZodCheckLowerCase",(e,t)=>{t.pattern??(t.pattern=fc),Cn.init(e,t)}),xc=b("$ZodCheckUpperCase",(e,t)=>{t.pattern??(t.pattern=gc),Cn.init(e,t)}),kc=b("$ZodCheckIncludes",(e,t)=>{ge.init(e,t);const n=ht(t.includes),i=new RegExp(typeof t.position=="number"?`^.{${t.position}}${n}`:n);t.pattern=i,e._zod.onattach.push(o=>{const a=o._zod.bag;a.patterns??(a.patterns=new Set),a.patterns.add(i)}),e._zod.check=o=>{o.value.includes(t.includes,t.position)||o.issues.push({origin:"string",code:"invalid_format",format:"includes",includes:t.includes,input:o.value,inst:e,continue:!t.abort})}}),Cc=b("$ZodCheckStartsWith",(e,t)=>{ge.init(e,t);const n=new RegExp(`^${ht(t.prefix)}.*`);t.pattern??(t.pattern=n),e._zod.onattach.push(i=>{const o=i._zod.bag;o.patterns??(o.patterns=new Set),o.patterns.add(n)}),e._zod.check=i=>{i.value.startsWith(t.prefix)||i.issues.push({origin:"string",code:"invalid_format",format:"starts_with",prefix:t.prefix,input:i.value,inst:e,continue:!t.abort})}}),Sc=b("$ZodCheckEndsWith",(e,t)=>{ge.init(e,t);const n=new RegExp(`.*${ht(t.suffix)}$`);t.pattern??(t.pattern=n),e._zod.onattach.push(i=>{const o=i._zod.bag;o.patterns??(o.patterns=new Set),o.patterns.add(n)}),e._zod.check=i=>{i.value.endsWith(t.suffix)||i.issues.push({origin:"string",code:"invalid_format",format:"ends_with",suffix:t.suffix,input:i.value,inst:e,continue:!t.abort})}}),Tc=b("$ZodCheckOverwrite",(e,t)=>{ge.init(e,t),e._zod.check=n=>{n.value=t.tx(n.value)}});class Ec{constructor(t=[]){this.content=[],this.indent=0,this&&(this.args=t)}indented(t){this.indent+=1,t(this),this.indent-=1}write(t){if(typeof t=="function"){t(this,{execution:"sync"}),t(this,{execution:"async"});return}const i=t.split(`
`).filter(r=>r),o=Math.min(...i.map(r=>r.length-r.trimStart().length)),a=i.map(r=>r.slice(o)).map(r=>" ".repeat(this.indent*2)+r);for(const r of a)this.content.push(r)}compile(){const t=Function,n=this?.args,o=[...(this?.content??[""]).map(a=>`  ${a}`)];return new t(...n,o.join(`
`))}}const Ac={major:4,minor:1,patch:12},ie=b("$ZodType",(e,t)=>{var n;e??(e={}),e._zod.def=t,e._zod.bag=e._zod.bag||{},e._zod.version=Ac;const i=[...e._zod.def.checks??[]];e._zod.traits.has("$ZodCheck")&&i.unshift(e);for(const o of i)for(const a of o._zod.onattach)a(e);if(i.length===0)(n=e._zod).deferred??(n.deferred=[]),e._zod.deferred?.push(()=>{e._zod.run=e._zod.parse});else{const o=(r,c,d)=>{let u=pt(r),v;for(const f of c){if(f._zod.def.when){if(!f._zod.def.when(r))continue}else if(u)continue;const y=r.issues.length,$=f._zod.check(r);if($ instanceof Promise&&d?.async===!1)throw new ft;if(v||$ instanceof Promise)v=(v??Promise.resolve()).then(async()=>{await $,r.issues.length!==y&&(u||(u=pt(r,y)))});else{if(r.issues.length===y)continue;u||(u=pt(r,y))}}return v?v.then(()=>r):r},a=(r,c,d)=>{if(pt(r))return r.aborted=!0,r;const u=o(c,i,d);if(u instanceof Promise){if(d.async===!1)throw new ft;return u.then(v=>e._zod.parse(v,d))}return e._zod.parse(u,d)};e._zod.run=(r,c)=>{if(c.skipChecks)return e._zod.parse(r,c);if(c.direction==="backward"){const u=e._zod.parse({value:r.value,issues:[]},{...c,skipChecks:!0});return u instanceof Promise?u.then(v=>a(v,r,c)):a(u,r,c)}const d=e._zod.parse(r,c);if(d instanceof Promise){if(c.async===!1)throw new ft;return d.then(u=>o(u,i,c))}return o(d,i,c)}}e["~standard"]={validate:o=>{try{const a=zs(e,o);return a.success?{value:a.data}:{issues:a.error?.issues}}catch{return Ps(e,o).then(r=>r.success?{value:r.data}:{issues:r.error?.issues})}},vendor:"zod",version:1}}),fi=b("$ZodString",(e,t)=>{ie.init(e,t),e._zod.pattern=[...e?._zod.bag?.patterns??[]].pop()??dc(e._zod.bag),e._zod.parse=(n,i)=>{if(t.coerce)try{n.value=String(n.value)}catch{}return typeof n.value=="string"||n.issues.push({expected:"string",code:"invalid_type",input:n.value,inst:e}),n}}),te=b("$ZodStringFormat",(e,t)=>{Cn.init(e,t),fi.init(e,t)}),Mc=b("$ZodGUID",(e,t)=>{t.pattern??(t.pattern=Ks),te.init(e,t)}),jc=b("$ZodUUID",(e,t)=>{if(t.version){const i={v1:1,v2:2,v3:3,v4:4,v5:5,v6:6,v7:7,v8:8}[t.version];if(i===void 0)throw new Error(`Invalid UUID version: "${t.version}"`);t.pattern??(t.pattern=oo(i))}else t.pattern??(t.pattern=oo());te.init(e,t)}),Ic=b("$ZodEmail",(e,t)=>{t.pattern??(t.pattern=Qs),te.init(e,t)}),zc=b("$ZodURL",(e,t)=>{te.init(e,t),e._zod.check=n=>{try{const i=n.value.trim(),o=new URL(i);t.hostname&&(t.hostname.lastIndex=0,t.hostname.test(o.hostname)||n.issues.push({code:"invalid_format",format:"url",note:"Invalid hostname",pattern:ac.source,input:n.value,inst:e,continue:!t.abort})),t.protocol&&(t.protocol.lastIndex=0,t.protocol.test(o.protocol.endsWith(":")?o.protocol.slice(0,-1):o.protocol)||n.issues.push({code:"invalid_format",format:"url",note:"Invalid protocol",pattern:t.protocol.source,input:n.value,inst:e,continue:!t.abort})),t.normalize?n.value=o.href:n.value=i;return}catch{n.issues.push({code:"invalid_format",format:"url",input:n.value,inst:e,continue:!t.abort})}}}),Pc=b("$ZodEmoji",(e,t)=>{t.pattern??(t.pattern=Xs()),te.init(e,t)}),Rc=b("$ZodNanoID",(e,t)=>{t.pattern??(t.pattern=Gs),te.init(e,t)}),Dc=b("$ZodCUID",(e,t)=>{t.pattern??(t.pattern=qs),te.init(e,t)}),Oc=b("$ZodCUID2",(e,t)=>{t.pattern??(t.pattern=Us),te.init(e,t)}),Nc=b("$ZodULID",(e,t)=>{t.pattern??(t.pattern=Hs),te.init(e,t)}),Bc=b("$ZodXID",(e,t)=>{t.pattern??(t.pattern=Ws),te.init(e,t)}),Lc=b("$ZodKSUID",(e,t)=>{t.pattern??(t.pattern=Vs),te.init(e,t)}),Zc=b("$ZodISODateTime",(e,t)=>{t.pattern??(t.pattern=lc(t)),te.init(e,t)}),Fc=b("$ZodISODate",(e,t)=>{t.pattern??(t.pattern=sc),te.init(e,t)}),qc=b("$ZodISOTime",(e,t)=>{t.pattern??(t.pattern=cc(t)),te.init(e,t)}),Uc=b("$ZodISODuration",(e,t)=>{t.pattern??(t.pattern=Ys),te.init(e,t)}),Hc=b("$ZodIPv4",(e,t)=>{t.pattern??(t.pattern=ec),te.init(e,t),e._zod.onattach.push(n=>{const i=n._zod.bag;i.format="ipv4"})}),Wc=b("$ZodIPv6",(e,t)=>{t.pattern??(t.pattern=tc),te.init(e,t),e._zod.onattach.push(n=>{const i=n._zod.bag;i.format="ipv6"}),e._zod.check=n=>{try{new URL(`http://[${n.value}]`)}catch{n.issues.push({code:"invalid_format",format:"ipv6",input:n.value,inst:e,continue:!t.abort})}}}),Vc=b("$ZodCIDRv4",(e,t)=>{t.pattern??(t.pattern=nc),te.init(e,t)}),Gc=b("$ZodCIDRv6",(e,t)=>{t.pattern??(t.pattern=ic),te.init(e,t),e._zod.check=n=>{const i=n.value.split("/");try{if(i.length!==2)throw new Error;const[o,a]=i;if(!a)throw new Error;const r=Number(a);if(`${r}`!==a)throw new Error;if(r<0||r>128)throw new Error;new URL(`http://[${o}]`)}catch{n.issues.push({code:"invalid_format",format:"cidrv6",input:n.value,inst:e,continue:!t.abort})}}});function na(e){if(e==="")return!0;if(e.length%4!==0)return!1;try{return atob(e),!0}catch{return!1}}const Yc=b("$ZodBase64",(e,t)=>{t.pattern??(t.pattern=oc),te.init(e,t),e._zod.onattach.push(n=>{n._zod.bag.contentEncoding="base64"}),e._zod.check=n=>{na(n.value)||n.issues.push({code:"invalid_format",format:"base64",input:n.value,inst:e,continue:!t.abort})}});function Kc(e){if(!Ko.test(e))return!1;const t=e.replace(/[-_]/g,i=>i==="-"?"+":"/"),n=t.padEnd(Math.ceil(t.length/4)*4,"=");return na(n)}const Qc=b("$ZodBase64URL",(e,t)=>{t.pattern??(t.pattern=Ko),te.init(e,t),e._zod.onattach.push(n=>{n._zod.bag.contentEncoding="base64url"}),e._zod.check=n=>{Kc(n.value)||n.issues.push({code:"invalid_format",format:"base64url",input:n.value,inst:e,continue:!t.abort})}}),Jc=b("$ZodE164",(e,t)=>{t.pattern??(t.pattern=rc),te.init(e,t)});function Xc(e,t=null){try{const n=e.split(".");if(n.length!==3)return!1;const[i]=n;if(!i)return!1;const o=JSON.parse(atob(i));return!("typ"in o&&o?.typ!=="JWT"||!o.alg||t&&(!("alg"in o)||o.alg!==t))}catch{return!1}}const el=b("$ZodJWT",(e,t)=>{te.init(e,t),e._zod.check=n=>{Xc(n.value,t.alg)||n.issues.push({code:"invalid_format",format:"jwt",input:n.value,inst:e,continue:!t.abort})}}),ia=b("$ZodNumber",(e,t)=>{ie.init(e,t),e._zod.pattern=e._zod.bag.pattern??pc,e._zod.parse=(n,i)=>{if(t.coerce)try{n.value=Number(n.value)}catch{}const o=n.value;if(typeof o=="number"&&!Number.isNaN(o)&&Number.isFinite(o))return n;const a=typeof o=="number"?Number.isNaN(o)?"NaN":Number.isFinite(o)?void 0:"Infinity":void 0;return n.issues.push({expected:"number",code:"invalid_type",input:o,inst:e,...a?{received:a}:{}}),n}}),tl=b("$ZodNumber",(e,t)=>{vc.init(e,t),ia.init(e,t)}),nl=b("$ZodBoolean",(e,t)=>{ie.init(e,t),e._zod.pattern=mc,e._zod.parse=(n,i)=>{if(t.coerce)try{n.value=!!n.value}catch{}const o=n.value;return typeof o=="boolean"||n.issues.push({expected:"boolean",code:"invalid_type",input:o,inst:e}),n}}),il=b("$ZodUnknown",(e,t)=>{ie.init(e,t),e._zod.parse=n=>n}),ol=b("$ZodNever",(e,t)=>{ie.init(e,t),e._zod.parse=(n,i)=>(n.issues.push({expected:"never",code:"invalid_type",input:n.value,inst:e}),n)});function ao(e,t,n){e.issues.length&&t.issues.push(...Wo(n,e.issues)),t.value[n]=e.value}const al=b("$ZodArray",(e,t)=>{ie.init(e,t),e._zod.parse=(n,i)=>{const o=n.value;if(!Array.isArray(o))return n.issues.push({expected:"array",code:"invalid_type",input:o,inst:e}),n;n.value=Array(o.length);const a=[];for(let r=0;r<o.length;r++){const c=o[r],d=t.element._zod.run({value:c,issues:[]},i);d instanceof Promise?a.push(d.then(u=>ao(u,n,r))):ao(d,n,r)}return a.length?Promise.all(a).then(()=>n):n}});function cn(e,t,n,i){e.issues.length&&t.issues.push(...Wo(n,e.issues)),e.value===void 0?n in i&&(t.value[n]=void 0):t.value[n]=e.value}function oa(e){const t=Object.keys(e.shape);for(const i of t)if(!e.shape?.[i]?._zod?.traits?.has("$ZodType"))throw new Error(`Invalid element at key "${i}": expected a Zod schema`);const n=$s(e.shape);return{...e,keys:t,keySet:new Set(t),numKeys:t.length,optionalKeys:new Set(n)}}function aa(e,t,n,i,o,a){const r=[],c=o.keySet,d=o.catchall._zod,u=d.def.type;for(const v of Object.keys(t)){if(c.has(v))continue;if(u==="never"){r.push(v);continue}const f=d.run({value:t[v],issues:[]},i);f instanceof Promise?e.push(f.then(y=>cn(y,n,v,t))):cn(f,n,v,t)}return r.length&&n.issues.push({code:"unrecognized_keys",keys:r,input:t,inst:a}),e.length?Promise.all(e).then(()=>n):n}const rl=b("$ZodObject",(e,t)=>{if(ie.init(e,t),!Object.getOwnPropertyDescriptor(t,"shape")?.get){const c=t.shape;Object.defineProperty(t,"shape",{get:()=>{const d={...c};return Object.defineProperty(t,"shape",{value:d}),d}})}const i=ci(()=>oa(t));X(e._zod,"propValues",()=>{const c=t.shape,d={};for(const u in c){const v=c[u]._zod;if(v.values){d[u]??(d[u]=new Set);for(const f of v.values)d[u].add(f)}}return d});const o=sn,a=t.catchall;let r;e._zod.parse=(c,d)=>{r??(r=i.value);const u=c.value;if(!o(u))return c.issues.push({expected:"object",code:"invalid_type",input:u,inst:e}),c;c.value={};const v=[],f=r.shape;for(const y of r.keys){const T=f[y]._zod.run({value:u[y],issues:[]},d);T instanceof Promise?v.push(T.then(L=>cn(L,c,y,u))):cn(T,c,y,u)}return a?aa(v,u,c,d,i.value,e):v.length?Promise.all(v).then(()=>c):c}}),sl=b("$ZodObjectJIT",(e,t)=>{rl.init(e,t);const n=e._zod.parse,i=ci(()=>oa(t)),o=y=>{const $=new Ec(["shape","payload","ctx"]),T=i.value,L=Z=>{const Q=io(Z);return`shape[${Q}]._zod.run({ value: input[${Q}], issues: [] }, ctx)`};$.write("const input = payload.value;");const A=Object.create(null);let D=0;for(const Z of T.keys)A[Z]=`key_${D++}`;$.write("const newResult = {};");for(const Z of T.keys){const Q=A[Z],S=io(Z);$.write(`const ${Q} = ${L(Z)};`),$.write(`
        if (${Q}.issues.length) {
          payload.issues = payload.issues.concat(${Q}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${S}, ...iss.path] : [${S}]
          })));
        }
        
        
        if (${Q}.value === undefined) {
          if (${S} in input) {
            newResult[${S}] = undefined;
          }
        } else {
          newResult[${S}] = ${Q}.value;
        }
        
      `)}$.write("payload.value = newResult;"),$.write("return payload;");const O=$.compile();return(Z,Q)=>O(y,Z,Q)};let a;const r=sn,c=!qo.jitless,u=c&&_s.value,v=t.catchall;let f;e._zod.parse=(y,$)=>{f??(f=i.value);const T=y.value;return r(T)?c&&u&&$?.async===!1&&$.jitless!==!0?(a||(a=o(t.shape)),y=a(y,$),v?aa([],T,y,$,f,e):y):n(y,$):(y.issues.push({expected:"object",code:"invalid_type",input:T,inst:e}),y)}});function ro(e,t,n,i){for(const a of e)if(a.issues.length===0)return t.value=a.value,t;const o=e.filter(a=>!pt(a));return o.length===1?(t.value=o[0].value,o[0]):(t.issues.push({code:"invalid_union",input:t.value,inst:n,errors:e.map(a=>a.issues.map(r=>et(r,i,Xe())))}),t)}const cl=b("$ZodUnion",(e,t)=>{ie.init(e,t),X(e._zod,"optin",()=>t.options.some(o=>o._zod.optin==="optional")?"optional":void 0),X(e._zod,"optout",()=>t.options.some(o=>o._zod.optout==="optional")?"optional":void 0),X(e._zod,"values",()=>{if(t.options.every(o=>o._zod.values))return new Set(t.options.flatMap(o=>Array.from(o._zod.values)))}),X(e._zod,"pattern",()=>{if(t.options.every(o=>o._zod.pattern)){const o=t.options.map(a=>a._zod.pattern);return new RegExp(`^(${o.map(a=>di(a.source)).join("|")})$`)}});const n=t.options.length===1,i=t.options[0]._zod.run;e._zod.parse=(o,a)=>{if(n)return i(o,a);let r=!1;const c=[];for(const d of t.options){const u=d._zod.run({value:o.value,issues:[]},a);if(u instanceof Promise)c.push(u),r=!0;else{if(u.issues.length===0)return u;c.push(u)}}return r?Promise.all(c).then(d=>ro(d,o,e,a)):ro(c,o,e,a)}}),ll=b("$ZodIntersection",(e,t)=>{ie.init(e,t),e._zod.parse=(n,i)=>{const o=n.value,a=t.left._zod.run({value:o,issues:[]},i),r=t.right._zod.run({value:o,issues:[]},i);return a instanceof Promise||r instanceof Promise?Promise.all([a,r]).then(([d,u])=>so(n,d,u)):so(n,a,r)}});function Qn(e,t){if(e===t)return{valid:!0,data:e};if(e instanceof Date&&t instanceof Date&&+e==+t)return{valid:!0,data:e};if(Rt(e)&&Rt(t)){const n=Object.keys(t),i=Object.keys(e).filter(a=>n.indexOf(a)!==-1),o={...e,...t};for(const a of i){const r=Qn(e[a],t[a]);if(!r.valid)return{valid:!1,mergeErrorPath:[a,...r.mergeErrorPath]};o[a]=r.data}return{valid:!0,data:o}}if(Array.isArray(e)&&Array.isArray(t)){if(e.length!==t.length)return{valid:!1,mergeErrorPath:[]};const n=[];for(let i=0;i<e.length;i++){const o=e[i],a=t[i],r=Qn(o,a);if(!r.valid)return{valid:!1,mergeErrorPath:[i,...r.mergeErrorPath]};n.push(r.data)}return{valid:!0,data:n}}return{valid:!1,mergeErrorPath:[]}}function so(e,t,n){if(t.issues.length&&e.issues.push(...t.issues),n.issues.length&&e.issues.push(...n.issues),pt(e))return e;const i=Qn(t.value,n.value);if(!i.valid)throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(i.mergeErrorPath)}`);return e.value=i.data,e}const dl=b("$ZodEnum",(e,t)=>{ie.init(e,t);const n=ys(t.entries),i=new Set(n);e._zod.values=i,e._zod.pattern=new RegExp(`^(${n.filter(o=>ws.has(typeof o)).map(o=>typeof o=="string"?ht(o):o.toString()).join("|")})$`),e._zod.parse=(o,a)=>{const r=o.value;return i.has(r)||o.issues.push({code:"invalid_value",values:n,input:r,inst:e}),o}}),ul=b("$ZodLiteral",(e,t)=>{if(ie.init(e,t),t.values.length===0)throw new Error("Cannot create literal schema with no valid values");e._zod.values=new Set(t.values),e._zod.pattern=new RegExp(`^(${t.values.map(n=>typeof n=="string"?ht(n):n?ht(n.toString()):String(n)).join("|")})$`),e._zod.parse=(n,i)=>{const o=n.value;return e._zod.values.has(o)||n.issues.push({code:"invalid_value",values:t.values,input:o,inst:e}),n}}),pl=b("$ZodTransform",(e,t)=>{ie.init(e,t),e._zod.parse=(n,i)=>{if(i.direction==="backward")throw new Fo(e.constructor.name);const o=t.transform(n.value,n);if(i.async)return(o instanceof Promise?o:Promise.resolve(o)).then(r=>(n.value=r,n));if(o instanceof Promise)throw new ft;return n.value=o,n}});function co(e,t){return e.issues.length&&t===void 0?{issues:[],value:void 0}:e}const ml=b("$ZodOptional",(e,t)=>{ie.init(e,t),e._zod.optin="optional",e._zod.optout="optional",X(e._zod,"values",()=>t.innerType._zod.values?new Set([...t.innerType._zod.values,void 0]):void 0),X(e._zod,"pattern",()=>{const n=t.innerType._zod.pattern;return n?new RegExp(`^(${di(n.source)})?$`):void 0}),e._zod.parse=(n,i)=>{if(t.innerType._zod.optin==="optional"){const o=t.innerType._zod.run(n,i);return o instanceof Promise?o.then(a=>co(a,n.value)):co(o,n.value)}return n.value===void 0?n:t.innerType._zod.run(n,i)}}),fl=b("$ZodNullable",(e,t)=>{ie.init(e,t),X(e._zod,"optin",()=>t.innerType._zod.optin),X(e._zod,"optout",()=>t.innerType._zod.optout),X(e._zod,"pattern",()=>{const n=t.innerType._zod.pattern;return n?new RegExp(`^(${di(n.source)}|null)$`):void 0}),X(e._zod,"values",()=>t.innerType._zod.values?new Set([...t.innerType._zod.values,null]):void 0),e._zod.parse=(n,i)=>n.value===null?n:t.innerType._zod.run(n,i)}),gl=b("$ZodDefault",(e,t)=>{ie.init(e,t),e._zod.optin="optional",X(e._zod,"values",()=>t.innerType._zod.values),e._zod.parse=(n,i)=>{if(i.direction==="backward")return t.innerType._zod.run(n,i);if(n.value===void 0)return n.value=t.defaultValue,n;const o=t.innerType._zod.run(n,i);return o instanceof Promise?o.then(a=>lo(a,t)):lo(o,t)}});function lo(e,t){return e.value===void 0&&(e.value=t.defaultValue),e}const hl=b("$ZodPrefault",(e,t)=>{ie.init(e,t),e._zod.optin="optional",X(e._zod,"values",()=>t.innerType._zod.values),e._zod.parse=(n,i)=>(i.direction==="backward"||n.value===void 0&&(n.value=t.defaultValue),t.innerType._zod.run(n,i))}),vl=b("$ZodNonOptional",(e,t)=>{ie.init(e,t),X(e._zod,"values",()=>{const n=t.innerType._zod.values;return n?new Set([...n].filter(i=>i!==void 0)):void 0}),e._zod.parse=(n,i)=>{const o=t.innerType._zod.run(n,i);return o instanceof Promise?o.then(a=>uo(a,e)):uo(o,e)}});function uo(e,t){return!e.issues.length&&e.value===void 0&&e.issues.push({code:"invalid_type",expected:"nonoptional",input:e.value,inst:t}),e}const yl=b("$ZodCatch",(e,t)=>{ie.init(e,t),X(e._zod,"optin",()=>t.innerType._zod.optin),X(e._zod,"optout",()=>t.innerType._zod.optout),X(e._zod,"values",()=>t.innerType._zod.values),e._zod.parse=(n,i)=>{if(i.direction==="backward")return t.innerType._zod.run(n,i);const o=t.innerType._zod.run(n,i);return o instanceof Promise?o.then(a=>(n.value=a.value,a.issues.length&&(n.value=t.catchValue({...n,error:{issues:a.issues.map(r=>et(r,i,Xe()))},input:n.value}),n.issues=[]),n)):(n.value=o.value,o.issues.length&&(n.value=t.catchValue({...n,error:{issues:o.issues.map(a=>et(a,i,Xe()))},input:n.value}),n.issues=[]),n)}}),bl=b("$ZodPipe",(e,t)=>{ie.init(e,t),X(e._zod,"values",()=>t.in._zod.values),X(e._zod,"optin",()=>t.in._zod.optin),X(e._zod,"optout",()=>t.out._zod.optout),X(e._zod,"propValues",()=>t.in._zod.propValues),e._zod.parse=(n,i)=>{if(i.direction==="backward"){const a=t.out._zod.run(n,i);return a instanceof Promise?a.then(r=>Xt(r,t.in,i)):Xt(a,t.in,i)}const o=t.in._zod.run(n,i);return o instanceof Promise?o.then(a=>Xt(a,t.out,i)):Xt(o,t.out,i)}});function Xt(e,t,n){return e.issues.length?(e.aborted=!0,e):t._zod.run({value:e.value,issues:e.issues},n)}const _l=b("$ZodReadonly",(e,t)=>{ie.init(e,t),X(e._zod,"propValues",()=>t.innerType._zod.propValues),X(e._zod,"values",()=>t.innerType._zod.values),X(e._zod,"optin",()=>t.innerType._zod.optin),X(e._zod,"optout",()=>t.innerType._zod.optout),e._zod.parse=(n,i)=>{if(i.direction==="backward")return t.innerType._zod.run(n,i);const o=t.innerType._zod.run(n,i);return o instanceof Promise?o.then(po):po(o)}});function po(e){return e.value=Object.freeze(e.value),e}const wl=b("$ZodCustom",(e,t)=>{ge.init(e,t),ie.init(e,t),e._zod.parse=(n,i)=>n,e._zod.check=n=>{const i=n.value,o=t.fn(i);if(o instanceof Promise)return o.then(a=>mo(a,n,i,e));mo(o,n,i,e)}});function mo(e,t,n,i){if(!e){const o={code:"custom",input:n,inst:i,path:[...i._zod.def.path??[]],continue:!i._zod.def.abort};i._zod.def.params&&(o.params=i._zod.def.params),t.issues.push(Dt(o))}}class $l{constructor(){this._map=new WeakMap,this._idmap=new Map}add(t,...n){const i=n[0];if(this._map.set(t,i),i&&typeof i=="object"&&"id"in i){if(this._idmap.has(i.id))throw new Error(`ID ${i.id} already exists in the registry`);this._idmap.set(i.id,t)}return this}clear(){return this._map=new WeakMap,this._idmap=new Map,this}remove(t){const n=this._map.get(t);return n&&typeof n=="object"&&"id"in n&&this._idmap.delete(n.id),this._map.delete(t),this}get(t){const n=t._zod.parent;if(n){const i={...this.get(n)??{}};delete i.id;const o={...i,...this._map.get(t)};return Object.keys(o).length?o:void 0}return this._map.get(t)}has(t){return this._map.has(t)}}function xl(){return new $l}const en=xl();function kl(e,t){return new e({type:"string",...P(t)})}function Cl(e,t){return new e({type:"string",format:"email",check:"string_format",abort:!1,...P(t)})}function fo(e,t){return new e({type:"string",format:"guid",check:"string_format",abort:!1,...P(t)})}function Sl(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,...P(t)})}function Tl(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v4",...P(t)})}function El(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v6",...P(t)})}function Al(e,t){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v7",...P(t)})}function Ml(e,t){return new e({type:"string",format:"url",check:"string_format",abort:!1,...P(t)})}function jl(e,t){return new e({type:"string",format:"emoji",check:"string_format",abort:!1,...P(t)})}function Il(e,t){return new e({type:"string",format:"nanoid",check:"string_format",abort:!1,...P(t)})}function zl(e,t){return new e({type:"string",format:"cuid",check:"string_format",abort:!1,...P(t)})}function Pl(e,t){return new e({type:"string",format:"cuid2",check:"string_format",abort:!1,...P(t)})}function Rl(e,t){return new e({type:"string",format:"ulid",check:"string_format",abort:!1,...P(t)})}function Dl(e,t){return new e({type:"string",format:"xid",check:"string_format",abort:!1,...P(t)})}function Ol(e,t){return new e({type:"string",format:"ksuid",check:"string_format",abort:!1,...P(t)})}function Nl(e,t){return new e({type:"string",format:"ipv4",check:"string_format",abort:!1,...P(t)})}function Bl(e,t){return new e({type:"string",format:"ipv6",check:"string_format",abort:!1,...P(t)})}function Ll(e,t){return new e({type:"string",format:"cidrv4",check:"string_format",abort:!1,...P(t)})}function Zl(e,t){return new e({type:"string",format:"cidrv6",check:"string_format",abort:!1,...P(t)})}function Fl(e,t){return new e({type:"string",format:"base64",check:"string_format",abort:!1,...P(t)})}function ql(e,t){return new e({type:"string",format:"base64url",check:"string_format",abort:!1,...P(t)})}function Ul(e,t){return new e({type:"string",format:"e164",check:"string_format",abort:!1,...P(t)})}function Hl(e,t){return new e({type:"string",format:"jwt",check:"string_format",abort:!1,...P(t)})}function Wl(e,t){return new e({type:"string",format:"datetime",check:"string_format",offset:!1,local:!1,precision:null,...P(t)})}function Vl(e,t){return new e({type:"string",format:"date",check:"string_format",...P(t)})}function Gl(e,t){return new e({type:"string",format:"time",check:"string_format",precision:null,...P(t)})}function Yl(e,t){return new e({type:"string",format:"duration",check:"string_format",...P(t)})}function Kl(e,t){return new e({type:"number",checks:[],...P(t)})}function Ql(e,t){return new e({type:"number",check:"number_format",abort:!1,format:"safeint",...P(t)})}function Jl(e,t){return new e({type:"boolean",...P(t)})}function Xl(e){return new e({type:"unknown"})}function ed(e,t){return new e({type:"never",...P(t)})}function go(e,t){return new ea({check:"less_than",...P(t),value:e,inclusive:!1})}function Fn(e,t){return new ea({check:"less_than",...P(t),value:e,inclusive:!0})}function ho(e,t){return new ta({check:"greater_than",...P(t),value:e,inclusive:!1})}function qn(e,t){return new ta({check:"greater_than",...P(t),value:e,inclusive:!0})}function vo(e,t){return new hc({check:"multiple_of",...P(t),value:e})}function ra(e,t){return new yc({check:"max_length",...P(t),maximum:e})}function ln(e,t){return new bc({check:"min_length",...P(t),minimum:e})}function sa(e,t){return new _c({check:"length_equals",...P(t),length:e})}function td(e,t){return new wc({check:"string_format",format:"regex",...P(t),pattern:e})}function nd(e){return new $c({check:"string_format",format:"lowercase",...P(e)})}function id(e){return new xc({check:"string_format",format:"uppercase",...P(e)})}function od(e,t){return new kc({check:"string_format",format:"includes",...P(t),includes:e})}function ad(e,t){return new Cc({check:"string_format",format:"starts_with",...P(t),prefix:e})}function rd(e,t){return new Sc({check:"string_format",format:"ends_with",...P(t),suffix:e})}function Ut(e){return new Tc({check:"overwrite",tx:e})}function sd(e){return Ut(t=>t.normalize(e))}function cd(){return Ut(e=>e.trim())}function ld(){return Ut(e=>e.toLowerCase())}function dd(){return Ut(e=>e.toUpperCase())}function ud(e,t,n){return new e({type:"array",element:t,...P(n)})}function pd(e,t,n){return new e({type:"custom",check:"custom",fn:t,...P(n)})}function md(e){const t=fd(n=>(n.addIssue=i=>{if(typeof i=="string")n.issues.push(Dt(i,n.value,t._zod.def));else{const o=i;o.fatal&&(o.continue=!1),o.code??(o.code="custom"),o.input??(o.input=n.value),o.inst??(o.inst=t),o.continue??(o.continue=!t._zod.def.abort),n.issues.push(Dt(o))}},e(n.value,n)));return t}function fd(e,t){const n=new ge({check:"custom",...P(t)});return n._zod.check=e,n}const gd=b("ZodISODateTime",(e,t)=>{Zc.init(e,t),ne.init(e,t)});function hd(e){return Wl(gd,e)}const vd=b("ZodISODate",(e,t)=>{Fc.init(e,t),ne.init(e,t)});function yd(e){return Vl(vd,e)}const bd=b("ZodISOTime",(e,t)=>{qc.init(e,t),ne.init(e,t)});function _d(e){return Gl(bd,e)}const wd=b("ZodISODuration",(e,t)=>{Uc.init(e,t),ne.init(e,t)});function $d(e){return Yl(wd,e)}const xd=(e,t)=>{Go.init(e,t),e.name="ZodError",Object.defineProperties(e,{format:{value:n=>Is(e,n)},flatten:{value:n=>js(e,n)},addIssue:{value:n=>{e.issues.push(n),e.message=JSON.stringify(e.issues,Kn,2)}},addIssues:{value:n=>{e.issues.push(...n),e.message=JSON.stringify(e.issues,Kn,2)}},isEmpty:{get(){return e.issues.length===0}}})},ke=b("ZodError",xd,{Parent:Error}),kd=pi(ke),Cd=mi(ke),Sd=xn(ke),Td=kn(ke),Ed=Rs(ke),Ad=Ds(ke),Md=Os(ke),jd=Ns(ke),Id=Bs(ke),zd=Ls(ke),Pd=Zs(ke),Rd=Fs(ke),re=b("ZodType",(e,t)=>(ie.init(e,t),e.def=t,e.type=t.type,Object.defineProperty(e,"_def",{value:t}),e.check=(...n)=>e.clone(rt(t,{checks:[...t.checks??[],...n.map(i=>typeof i=="function"?{_zod:{check:i,def:{check:"custom"},onattach:[]}}:i)]})),e.clone=(n,i)=>Ve(e,n,i),e.brand=()=>e,e.register=((n,i)=>(n.add(e,i),e)),e.parse=(n,i)=>kd(e,n,i,{callee:e.parse}),e.safeParse=(n,i)=>Sd(e,n,i),e.parseAsync=async(n,i)=>Cd(e,n,i,{callee:e.parseAsync}),e.safeParseAsync=async(n,i)=>Td(e,n,i),e.spa=e.safeParseAsync,e.encode=(n,i)=>Ed(e,n,i),e.decode=(n,i)=>Ad(e,n,i),e.encodeAsync=async(n,i)=>Md(e,n,i),e.decodeAsync=async(n,i)=>jd(e,n,i),e.safeEncode=(n,i)=>Id(e,n,i),e.safeDecode=(n,i)=>zd(e,n,i),e.safeEncodeAsync=async(n,i)=>Pd(e,n,i),e.safeDecodeAsync=async(n,i)=>Rd(e,n,i),e.refine=(n,i)=>e.check(Eu(n,i)),e.superRefine=n=>e.check(Au(n)),e.overwrite=n=>e.check(Ut(n)),e.optional=()=>$o(e),e.nullable=()=>xo(e),e.nullish=()=>$o(xo(e)),e.nonoptional=n=>wu(e,n),e.array=()=>Jn(e),e.or=n=>cu([e,n]),e.and=n=>du(e,n),e.transform=n=>ko(e,gu(n)),e.default=n=>yu(e,n),e.prefault=n=>_u(e,n),e.catch=n=>xu(e,n),e.pipe=n=>ko(e,n),e.readonly=()=>Su(e),e.describe=n=>{const i=e.clone();return en.add(i,{description:n}),i},Object.defineProperty(e,"description",{get(){return en.get(e)?.description},configurable:!0}),e.meta=(...n)=>{if(n.length===0)return en.get(e);const i=e.clone();return en.add(i,n[0]),i},e.isOptional=()=>e.safeParse(void 0).success,e.isNullable=()=>e.safeParse(null).success,e)),ca=b("_ZodString",(e,t)=>{fi.init(e,t),re.init(e,t);const n=e._zod.bag;e.format=n.format??null,e.minLength=n.minimum??null,e.maxLength=n.maximum??null,e.regex=(...i)=>e.check(td(...i)),e.includes=(...i)=>e.check(od(...i)),e.startsWith=(...i)=>e.check(ad(...i)),e.endsWith=(...i)=>e.check(rd(...i)),e.min=(...i)=>e.check(ln(...i)),e.max=(...i)=>e.check(ra(...i)),e.length=(...i)=>e.check(sa(...i)),e.nonempty=(...i)=>e.check(ln(1,...i)),e.lowercase=i=>e.check(nd(i)),e.uppercase=i=>e.check(id(i)),e.trim=()=>e.check(cd()),e.normalize=(...i)=>e.check(sd(...i)),e.toLowerCase=()=>e.check(ld()),e.toUpperCase=()=>e.check(dd())}),Dd=b("ZodString",(e,t)=>{fi.init(e,t),ca.init(e,t),e.email=n=>e.check(Cl(Od,n)),e.url=n=>e.check(Ml(Nd,n)),e.jwt=n=>e.check(Hl(Xd,n)),e.emoji=n=>e.check(jl(Bd,n)),e.guid=n=>e.check(fo(yo,n)),e.uuid=n=>e.check(Sl(tn,n)),e.uuidv4=n=>e.check(Tl(tn,n)),e.uuidv6=n=>e.check(El(tn,n)),e.uuidv7=n=>e.check(Al(tn,n)),e.nanoid=n=>e.check(Il(Ld,n)),e.guid=n=>e.check(fo(yo,n)),e.cuid=n=>e.check(zl(Zd,n)),e.cuid2=n=>e.check(Pl(Fd,n)),e.ulid=n=>e.check(Rl(qd,n)),e.base64=n=>e.check(Fl(Kd,n)),e.base64url=n=>e.check(ql(Qd,n)),e.xid=n=>e.check(Dl(Ud,n)),e.ksuid=n=>e.check(Ol(Hd,n)),e.ipv4=n=>e.check(Nl(Wd,n)),e.ipv6=n=>e.check(Bl(Vd,n)),e.cidrv4=n=>e.check(Ll(Gd,n)),e.cidrv6=n=>e.check(Zl(Yd,n)),e.e164=n=>e.check(Ul(Jd,n)),e.datetime=n=>e.check(hd(n)),e.date=n=>e.check(yd(n)),e.time=n=>e.check(_d(n)),e.duration=n=>e.check($d(n))});function gt(e){return kl(Dd,e)}const ne=b("ZodStringFormat",(e,t)=>{te.init(e,t),ca.init(e,t)}),Od=b("ZodEmail",(e,t)=>{Ic.init(e,t),ne.init(e,t)}),yo=b("ZodGUID",(e,t)=>{Mc.init(e,t),ne.init(e,t)}),tn=b("ZodUUID",(e,t)=>{jc.init(e,t),ne.init(e,t)}),Nd=b("ZodURL",(e,t)=>{zc.init(e,t),ne.init(e,t)}),Bd=b("ZodEmoji",(e,t)=>{Pc.init(e,t),ne.init(e,t)}),Ld=b("ZodNanoID",(e,t)=>{Rc.init(e,t),ne.init(e,t)}),Zd=b("ZodCUID",(e,t)=>{Dc.init(e,t),ne.init(e,t)}),Fd=b("ZodCUID2",(e,t)=>{Oc.init(e,t),ne.init(e,t)}),qd=b("ZodULID",(e,t)=>{Nc.init(e,t),ne.init(e,t)}),Ud=b("ZodXID",(e,t)=>{Bc.init(e,t),ne.init(e,t)}),Hd=b("ZodKSUID",(e,t)=>{Lc.init(e,t),ne.init(e,t)}),Wd=b("ZodIPv4",(e,t)=>{Hc.init(e,t),ne.init(e,t)}),Vd=b("ZodIPv6",(e,t)=>{Wc.init(e,t),ne.init(e,t)}),Gd=b("ZodCIDRv4",(e,t)=>{Vc.init(e,t),ne.init(e,t)}),Yd=b("ZodCIDRv6",(e,t)=>{Gc.init(e,t),ne.init(e,t)}),Kd=b("ZodBase64",(e,t)=>{Yc.init(e,t),ne.init(e,t)}),Qd=b("ZodBase64URL",(e,t)=>{Qc.init(e,t),ne.init(e,t)}),Jd=b("ZodE164",(e,t)=>{Jc.init(e,t),ne.init(e,t)}),Xd=b("ZodJWT",(e,t)=>{el.init(e,t),ne.init(e,t)}),la=b("ZodNumber",(e,t)=>{ia.init(e,t),re.init(e,t),e.gt=(i,o)=>e.check(ho(i,o)),e.gte=(i,o)=>e.check(qn(i,o)),e.min=(i,o)=>e.check(qn(i,o)),e.lt=(i,o)=>e.check(go(i,o)),e.lte=(i,o)=>e.check(Fn(i,o)),e.max=(i,o)=>e.check(Fn(i,o)),e.int=i=>e.check(bo(i)),e.safe=i=>e.check(bo(i)),e.positive=i=>e.check(ho(0,i)),e.nonnegative=i=>e.check(qn(0,i)),e.negative=i=>e.check(go(0,i)),e.nonpositive=i=>e.check(Fn(0,i)),e.multipleOf=(i,o)=>e.check(vo(i,o)),e.step=(i,o)=>e.check(vo(i,o)),e.finite=()=>e;const n=e._zod.bag;e.minValue=Math.max(n.minimum??Number.NEGATIVE_INFINITY,n.exclusiveMinimum??Number.NEGATIVE_INFINITY)??null,e.maxValue=Math.min(n.maximum??Number.POSITIVE_INFINITY,n.exclusiveMaximum??Number.POSITIVE_INFINITY)??null,e.isInt=(n.format??"").includes("int")||Number.isSafeInteger(n.multipleOf??.5),e.isFinite=!0,e.format=n.format??null});function Pe(e){return Kl(la,e)}const eu=b("ZodNumberFormat",(e,t)=>{tl.init(e,t),la.init(e,t)});function bo(e){return Ql(eu,e)}const tu=b("ZodBoolean",(e,t)=>{nl.init(e,t),re.init(e,t)});function _o(e){return Jl(tu,e)}const nu=b("ZodUnknown",(e,t)=>{il.init(e,t),re.init(e,t)});function wo(){return Xl(nu)}const iu=b("ZodNever",(e,t)=>{ol.init(e,t),re.init(e,t)});function ou(e){return ed(iu,e)}const au=b("ZodArray",(e,t)=>{al.init(e,t),re.init(e,t),e.element=t.element,e.min=(n,i)=>e.check(ln(n,i)),e.nonempty=n=>e.check(ln(1,n)),e.max=(n,i)=>e.check(ra(n,i)),e.length=(n,i)=>e.check(sa(n,i)),e.unwrap=()=>e.element});function Jn(e,t){return ud(au,e,t)}const ru=b("ZodObject",(e,t)=>{sl.init(e,t),re.init(e,t),X(e,"shape",()=>t.shape),e.keyof=()=>uu(Object.keys(e._zod.def.shape)),e.catchall=n=>e.clone({...e._zod.def,catchall:n}),e.passthrough=()=>e.clone({...e._zod.def,catchall:wo()}),e.loose=()=>e.clone({...e._zod.def,catchall:wo()}),e.strict=()=>e.clone({...e._zod.def,catchall:ou()}),e.strip=()=>e.clone({...e._zod.def,catchall:void 0}),e.extend=n=>Ss(e,n),e.safeExtend=n=>Ts(e,n),e.merge=n=>Es(e,n),e.pick=n=>ks(e,n),e.omit=n=>Cs(e,n),e.partial=(...n)=>As(da,e,n[0]),e.required=(...n)=>Ms(ua,e,n[0])});function gi(e,t){const n={type:"object",shape:e??{},...P(t)};return new ru(n)}const su=b("ZodUnion",(e,t)=>{cl.init(e,t),re.init(e,t),e.options=t.options});function cu(e,t){return new su({type:"union",options:e,...P(t)})}const lu=b("ZodIntersection",(e,t)=>{ll.init(e,t),re.init(e,t)});function du(e,t){return new lu({type:"intersection",left:e,right:t})}const Xn=b("ZodEnum",(e,t)=>{dl.init(e,t),re.init(e,t),e.enum=t.entries,e.options=Object.values(t.entries);const n=new Set(Object.keys(t.entries));e.extract=(i,o)=>{const a={};for(const r of i)if(n.has(r))a[r]=t.entries[r];else throw new Error(`Key ${r} not found in enum`);return new Xn({...t,checks:[],...P(o),entries:a})},e.exclude=(i,o)=>{const a={...t.entries};for(const r of i)if(n.has(r))delete a[r];else throw new Error(`Key ${r} not found in enum`);return new Xn({...t,checks:[],...P(o),entries:a})}});function uu(e,t){const n=Array.isArray(e)?Object.fromEntries(e.map(i=>[i,i])):e;return new Xn({type:"enum",entries:n,...P(t)})}const pu=b("ZodLiteral",(e,t)=>{ul.init(e,t),re.init(e,t),e.values=new Set(t.values),Object.defineProperty(e,"value",{get(){if(t.values.length>1)throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");return t.values[0]}})});function mu(e,t){return new pu({type:"literal",values:Array.isArray(e)?e:[e],...P(t)})}const fu=b("ZodTransform",(e,t)=>{pl.init(e,t),re.init(e,t),e._zod.parse=(n,i)=>{if(i.direction==="backward")throw new Fo(e.constructor.name);n.addIssue=a=>{if(typeof a=="string")n.issues.push(Dt(a,n.value,t));else{const r=a;r.fatal&&(r.continue=!1),r.code??(r.code="custom"),r.input??(r.input=n.value),r.inst??(r.inst=e),n.issues.push(Dt(r))}};const o=t.transform(n.value,n);return o instanceof Promise?o.then(a=>(n.value=a,n)):(n.value=o,n)}});function gu(e){return new fu({type:"transform",transform:e})}const da=b("ZodOptional",(e,t)=>{ml.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType});function $o(e){return new da({type:"optional",innerType:e})}const hu=b("ZodNullable",(e,t)=>{fl.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType});function xo(e){return new hu({type:"nullable",innerType:e})}const vu=b("ZodDefault",(e,t)=>{gl.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType,e.removeDefault=e.unwrap});function yu(e,t){return new vu({type:"default",innerType:e,get defaultValue(){return typeof t=="function"?t():Ho(t)}})}const bu=b("ZodPrefault",(e,t)=>{hl.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType});function _u(e,t){return new bu({type:"prefault",innerType:e,get defaultValue(){return typeof t=="function"?t():Ho(t)}})}const ua=b("ZodNonOptional",(e,t)=>{vl.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType});function wu(e,t){return new ua({type:"nonoptional",innerType:e,...P(t)})}const $u=b("ZodCatch",(e,t)=>{yl.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType,e.removeCatch=e.unwrap});function xu(e,t){return new $u({type:"catch",innerType:e,catchValue:typeof t=="function"?t:()=>t})}const ku=b("ZodPipe",(e,t)=>{bl.init(e,t),re.init(e,t),e.in=t.in,e.out=t.out});function ko(e,t){return new ku({type:"pipe",in:e,out:t})}const Cu=b("ZodReadonly",(e,t)=>{_l.init(e,t),re.init(e,t),e.unwrap=()=>e._zod.def.innerType});function Su(e){return new Cu({type:"readonly",innerType:e})}const Tu=b("ZodCustom",(e,t)=>{wl.init(e,t),re.init(e,t)});function Eu(e,t={}){return pd(Tu,e,t)}function Au(e){return md(e)}const At={SLOT_1:"BusinessEmpire_Save_Slot_1",SLOT_2:"BusinessEmpire_Save_Slot_2",SLOT_3:"BusinessEmpire_Save_Slot_3",METADATA:"BusinessEmpire_SaveMetadata"},pa=[At.SLOT_1,At.SLOT_2,At.SLOT_3];class Mu{constructor(){Qt.config({name:"BusinessEmpire",storeName:"gameData",description:"ビジネスエンパイア 2.0 ゲームセーブデータ"})}async get(t){try{return await Qt.getItem(t)}catch(n){throw n}}async set(t,n){try{await Qt.setItem(t,n)}catch(i){throw i}}async remove(t){try{await Qt.removeItem(t)}catch(n){throw n}}}const Je=new Mu,ma={async getItem(e){try{return await Je.get(e)}catch{return null}},async setItem(e,t){await Je.set(e,t)},async removeItem(e){await Je.remove(e)}},ju=gi({enabled:_o(),disabled:_o(),shownIds:Jn(gt()),pendingId:gt().nullable(),queue:Jn(gt()),version:mu(1)}),Iu=gi({year:Pe().int().min(2025).max(2100),month:Pe().int().min(1).max(12),week:Pe().int().min(1).max(4)}),zu=gi({slotId:Pe().int().min(1).max(3),companyName:gt().min(1).max(100),playTime:Pe().int().min(0),lastSaveDate:gt().datetime(),gameDate:Iu,money:Pe().int(),employeeCount:Pe().int().min(0),marketShare:Pe().min(0).max(100),brandLevel:Pe().int().min(0).max(10),checksum:gt().optional()});async function fa(e){const t=JSON.stringify(e);if(typeof crypto<"u"&&crypto.subtle){const o=new TextEncoder().encode(t),a=await crypto.subtle.digest("SHA-256",o);return Array.from(new Uint8Array(a)).map(c=>c.toString(16).padStart(2,"0")).join("")}let n=0;for(let i=0;i<t.length;i++){const o=t.charCodeAt(i);n=(n<<5)-n+o,n|=0}return n.toString(16)}async function Pu(e,t){return await fa(e)===t}async function hi(){try{return await Je.get(At.METADATA)||{}}catch{return{}}}async function ga(e){return(await hi())[e]||null}async function Ru(e,t,n){n[e]=t,await Je.set(At.METADATA,n)}async function Du(e){try{if(e<1||e>3)throw new Error(`無効なスロットID: ${e}（有効範囲: 1-3）`);const t=pa[e-1],n=await Je.get(t);if(!n)return null;const i=await ga(e);if(i?.checksum){const o=await Pu(n,i.checksum)}return n}catch(t){throw t}}async function Ou(e,t,n){try{if(e<1||e>3)throw new Error(`無効なスロットID: ${e}（有効範囲: 1-3）`);const i=pa[e-1],o=await fa(t),a={...n,checksum:o},r=zu.parse(a),c=await hi();await Je.set(i,t),await Ru(e,r,c)}catch(i){throw i}}async function Nu(e){try{return await ga(e)!==null}catch{return!1}}const Bu={money:1e7,employees:[],products:[],turn:1,year:2025,month:1,week:1,marketShare:.1,brandPower:1,monthlyRevenue:0,debt:0,isBankrupt:!1,revenueHistory:[],officeLevel:1,difficulty:"normal",competitorAttacks:[],lastNewsCategory:"",unlockedAchievements:[],tutorialStep:0,tutorialCompleted:!1,tutorialV2:{enabled:!0,disabled:!1,shownIds:[],pendingId:null,queue:[],version:1},wasLowMoney:!1,totalProductSales:{},gameMode:"management",ceo:null,documentQueue:[],documentHistory:[],documentStats:{totalProcessed:0,totalApproved:0,totalRejected:0,trapsDetected:0,trapsMissed:0},currentVisitor:null,visitorHistory:[],pendingDirectives:[],companyCulture:50,scandalRisk:0,isGameOver:!1,gameOverReason:null,_pendingCausalEffects:[]},M=Sn();let vi="overview",ha=1;const dn=JSON.parse(JSON.stringify(Lo));dn.forEach(e=>{e.share=e.initialShare});function N(){return M}function vt(){return vi}function yt(e){vi=e}function Un(){return ha}function Lu(e){ha=e}function xt(){return dn}function Zu(){const e=JSON.parse(JSON.stringify(Lo));dn.length=0,e.forEach(t=>{t.share=t.initialShare,dn.push(t)})}function Sn(){return JSON.parse(JSON.stringify(Bu))}function yi(e){Object.keys(M).forEach(t=>delete M[t]),Object.assign(M,e)}function va(){Array.isArray(M.employees)||(M.employees=[]),Array.isArray(M.products)||(M.products=[]),Array.isArray(M.revenueHistory)||(M.revenueHistory=[])}function Tn(){va(),M.money=Number(M.money)||0,M.turn=Number(M.turn)||1,M.year=Number(M.year)||2025,M.month=Number(M.month)||1,M.week=Number(M.week)||1,M.marketShare=Number(M.marketShare)||0,M.brandPower=Number(M.brandPower)||0,M.monthlyRevenue=Number(M.monthlyRevenue)||0,M.debt=Math.max(0,Number(M.debt)||0),M.isBankrupt=!!M.isBankrupt,M.officeLevel=Math.max(1,Math.min(5,Number(M.officeLevel)||1)),M.employees.forEach(t=>{if(t.salary=Number(t.salary)||0,(typeof t.abilities!="object"||t.abilities===null)&&(t.abilities={technical:0,sales:0,planning:0,management:0}),Object.keys(t.abilities).forEach(n=>{t.abilities[n]=Number(t.abilities[n])||0}),(!t.personalityKey||!le[t.personalityKey])&&(t.personalityKey="logical"),Array.isArray(t.subTraits)||(t.subTraits=[]),!t.hiddenTrait||!Ue[t.hiddenTrait]){const n=Object.keys(Ue);t.hiddenTrait=n[Math.floor(Math.random()*n.length)]}typeof t.hiddenTraitRevealed!="boolean"&&(t.hiddenTraitRevealed=!1),typeof t.joinedTurn!="number"&&(t.joinedTurn=M.turn||1),Array.isArray(t.growthHistory)||(t.growthHistory=[{turn:t.joinedTurn,event:"入社",description:"会社に参加しました"}]),(!t.department||!ue[t.department])&&(t.department="development"),(!t.position||!be[t.position])&&(t.position="staff"),typeof t.skillPoints!="number"&&(t.skillPoints=0),Array.isArray(t.unlockedSkills)||(t.unlockedSkills=[]),(!t.temperament||typeof t.temperament!="object")&&(t.temperament=$n(t.personalityKey)),typeof t.qualification!="string"&&t.qualification!==null&&(t.qualification=null)}),M.products.forEach(t=>{t.sales=Number(t.sales)||0,t.quality=Number(t.quality)||0}),typeof M.tutorialCompleted!="boolean"&&(M.tutorialCompleted=!1),(typeof M.tutorialStep!="number"||M.tutorialStep<0)&&(M.tutorialStep=0),typeof M.wasLowMoney!="boolean"&&(M.wasLowMoney=!1),ju.safeParse(M.tutorialV2).success||(M.tutorialV2={enabled:!M.tutorialCompleted,disabled:!1,shownIds:[],pendingId:null,queue:[],version:1}),M.gameMode||(M.gameMode="management"),Array.isArray(M.documentQueue)||(M.documentQueue=[]),Array.isArray(M.documentHistory)||(M.documentHistory=[]),M.documentStats||(M.documentStats={totalProcessed:0,totalApproved:0,totalRejected:0,trapsDetected:0,trapsMissed:0}),Array.isArray(M.visitorHistory)||(M.visitorHistory=[]),Array.isArray(M.pendingDirectives)||(M.pendingDirectives=[]),typeof M.companyCulture!="number"&&(M.companyCulture=50),typeof M.scandalRisk!="number"&&(M.scandalRisk=0),typeof M.isGameOver!="boolean"&&(M.isGameOver=!1),Array.isArray(M._pendingCausalEffects)||(M._pendingCausalEffects=[])}function bi(){yi(Sn()),Tn(),vi="overview"}const Re={1:{name:"アパートオフィス",emoji:"🏠",maxEmployees:6,description:"小さなアパートの一室からスタート",unlockConditions:{employees:1,money:0,marketShare:0}},2:{name:"シェアワーキングスペース",emoji:"☕",maxEmployees:12,description:"共用オフィスで成長の兆し",unlockConditions:{employees:6,money:15e5,marketShare:3}},3:{name:"小規模オフィス",emoji:"🏢",maxEmployees:24,description:"独立した小さなオフィス",unlockConditions:{employees:12,money:4e6,marketShare:6}},4:{name:"大規模オフィス",emoji:"🏛️",maxEmployees:40,description:"フロア全体を占める立派なオフィス",unlockConditions:{employees:24,money:9e6,marketShare:12}},5:{name:"自社ビル",emoji:"🏰",maxEmployees:70,description:"念願の自社ビル！業界のリーダーへ",unlockConditions:{employees:40,money:18e6,marketShare:22}}},Fu=[{category:"hiring",titleTemplate:"${department}部 中途採用稟議書",summaryTemplate:"${department}部の人員強化のため、${position}クラスの人材を${count}名採用したい。",benefitTemplate:"部門の生産性${percent}%向上が見込まれる",risksTemplate:"採用後のミスマッチリスク、人件費増加",baseAmount:{min:3e5,max:12e5},baseBenefit:{min:30,max:80},priority:"normal",possibleNatures:["clear_good","clear_bad","tradeoff"],possibleTraps:["incompetent_hire","inflated_cost"],clueTemplates:[{field:"採用予算",observation:"採用コストが業界平均の${ratio}倍"},{field:"提出者実績",observation:"${name}の過去の採用成功率は${percent}%"},{field:"部門状況",observation:"${department}部の現在の稼働率は${percent}%"}],triggerCategories:["training"]},{category:"hiring",titleTemplate:"新卒採用計画書",summaryTemplate:"来期の新卒採用枠として${count}名の確保を提案します。",benefitTemplate:"長期的な人材育成と組織の若返り",risksTemplate:"教育コスト、戦力化まで時間がかかる",baseAmount:{min:5e5,max:2e6},baseBenefit:{min:20,max:60},priority:"normal",possibleNatures:["clear_good","tradeoff","long_term"],possibleTraps:[null],clueTemplates:[{field:"教育体制",observation:"現在のメンター社員数は${count}名"},{field:"市場動向",observation:"今年の新卒市場は${condition}"}]},{category:"budget",titleTemplate:"${department}部 ${quarter}四半期予算申請",summaryTemplate:"${department}部の活動費として${amount}万円の予算配分を申請します。",benefitTemplate:"部門活動の円滑な推進",risksTemplate:"予算超過時の対応が困難",baseAmount:{min:1e6,max:5e6},baseBenefit:{min:40,max:70},priority:"high",possibleNatures:["clear_good","clear_bad","tradeoff"],possibleTraps:["inflated_cost","wasteful_spending","embezzlement"],clueTemplates:[{field:"予算内訳",observation:"交際費が前期比${percent}%増加"},{field:"実績対比",observation:"前期の予算消化率は${percent}%"},{field:"部門業績",observation:"${department}部の目標達成率は${percent}%"}]},{category:"budget",titleTemplate:"臨時予算追加申請",summaryTemplate:"${reason}のため、追加予算${amount}万円を申請します。",benefitTemplate:"緊急対応による損害防止",risksTemplate:"計画外支出による財務圧迫",baseAmount:{min:5e5,max:3e6},baseBenefit:{min:30,max:60},priority:"urgent",possibleNatures:["clear_good","clear_bad","gamble"],possibleTraps:["inflated_cost","fake_data"],clueTemplates:[{field:"緊急性",observation:"申請理由の発生が${timing}"},{field:"金額根拠",observation:"見積もりの取得先は${count}社"}]},{category:"product_plan",titleTemplate:"新製品企画提案書「${productName}」",summaryTemplate:"${market}市場向けの新製品を開発します。開発期間は${months}ヶ月を想定。",benefitTemplate:"新規市場参入により売上${amount}万円増加見込み",risksTemplate:"開発失敗リスク、市場の不確実性",baseAmount:{min:2e6,max:8e6},baseBenefit:{min:50,max:95},priority:"high",possibleNatures:["clear_good","gamble","long_term","tradeoff"],possibleTraps:["hidden_risk","fake_data"],clueTemplates:[{field:"市場調査",observation:"対象市場の成長率は年${percent}%"},{field:"競合分析",observation:"同分野の競合は${count}社が参入済み"},{field:"技術実現性",observation:"必要な技術の社内充足率は${percent}%"}],triggerCategories:["marketing","hiring"]},{category:"product_plan",titleTemplate:"既存製品改善計画",summaryTemplate:"${productName}の機能強化と品質改善を行います。",benefitTemplate:"顧客満足度向上とチャーンレート低減",risksTemplate:"開発リソースの一時的圧迫",baseAmount:{min:5e5,max:3e6},baseBenefit:{min:40,max:80},priority:"normal",possibleNatures:["clear_good","tradeoff"],possibleTraps:[null],clueTemplates:[{field:"顧客要望",observation:"改善要望の件数は直近${count}件"},{field:"工数見積",observation:"必要な開発工数は${hours}人月"}]},{category:"marketing",titleTemplate:"マーケティングキャンペーン企画書",summaryTemplate:"${channel}を活用したプロモーション施策を実施します。",benefitTemplate:"ブランド認知度${percent}%向上、リード獲得${count}件見込み",risksTemplate:"効果が不確実、コストパフォーマンスのリスク",baseAmount:{min:5e5,max:4e6},baseBenefit:{min:30,max:85},priority:"normal",possibleNatures:["clear_good","gamble","tradeoff"],possibleTraps:["wasteful_spending","inflated_cost"],clueTemplates:[{field:"ROI予測",observation:"過去の類似施策のROIは${percent}%"},{field:"代理店選定",observation:"提案代理店の実績は業界${rank}位"}]},{category:"equipment",titleTemplate:"${equipment}導入稟議書",summaryTemplate:"業務効率化のため${equipment}を導入します。",benefitTemplate:"作業効率${percent}%向上、${amount}万円/年のコスト削減",risksTemplate:"初期投資の回収に時間がかかる",baseAmount:{min:1e6,max:1e7},baseBenefit:{min:40,max:90},priority:"normal",possibleNatures:["clear_good","clear_bad","long_term","gamble"],possibleTraps:["inflated_cost","hidden_risk","conflict_interest"],clueTemplates:[{field:"見積比較",observation:"${count}社から相見積もりを取得"},{field:"導入実績",observation:"同業他社での導入実績は${count}件"},{field:"保守費用",observation:"年間保守費用は導入費の${percent}%"}]},{category:"equipment",titleTemplate:"オフィス環境改善提案",summaryTemplate:"従業員の作業環境を改善するための設備更新を提案します。",benefitTemplate:"従業員満足度向上、離職率低減",risksTemplate:"投資対効果の定量化が困難",baseAmount:{min:3e5,max:2e6},baseBenefit:{min:30,max:60},priority:"low",possibleNatures:["clear_good","tradeoff"],possibleTraps:["wasteful_spending"],clueTemplates:[{field:"従業員調査",observation:"環境改善要望は${percent}%の社員が回答"}]},{category:"personnel_change",titleTemplate:"人事異動提案書",summaryTemplate:"${name}を${fromDept}部から${toDept}部へ異動させることを提案します。",benefitTemplate:"適材適所の実現と組織活性化",risksTemplate:"本人の意向、異動先でのパフォーマンス不確定",baseAmount:{min:0,max:1e5},baseBenefit:{min:20,max:70},priority:"normal",possibleNatures:["clear_good","tradeoff","clear_bad"],possibleTraps:["conflict_interest"],clueTemplates:[{field:"本人意向",observation:"${name}の異動希望は${status}"},{field:"適性評価",observation:"異動先業務への適性スコアは${score}/100"}]},{category:"promotion",titleTemplate:"${name} 昇進推薦書",summaryTemplate:"${name}を${fromPosition}から${toPosition}へ昇進させることを推薦します。",benefitTemplate:"組織のモチベーション向上と人材定着",risksTemplate:"給与増加、期待に応えられないリスク",baseAmount:{min:5e4,max:2e5},baseBenefit:{min:40,max:80},priority:"normal",possibleNatures:["clear_good","tradeoff","clear_bad"],possibleTraps:["incompetent_hire","conflict_interest"],clueTemplates:[{field:"実績",observation:"${name}の直近${months}ヶ月の評価は${grade}"},{field:"部下からの評価",observation:"チームメンバーの信頼度は${percent}%"}]},{category:"training",titleTemplate:"${trainingName}研修実施計画",summaryTemplate:"${department}部の社員${count}名を対象に研修を実施します。",benefitTemplate:"スキルアップによる生産性${percent}%向上",risksTemplate:"研修期間中の業務停滞",baseAmount:{min:2e5,max:15e5},baseBenefit:{min:30,max:75},priority:"low",possibleNatures:["clear_good","tradeoff","long_term"],possibleTraps:["wasteful_spending","inflated_cost"],clueTemplates:[{field:"研修費",observation:"受講料が業界平均の${ratio}倍"},{field:"研修実績",observation:"過去の同種研修の効果測定結果は${result}"}]},{category:"salary_raise",titleTemplate:"${name} 給与改定申請",summaryTemplate:"${name}の給与を${percent}%引き上げることを申請します。",benefitTemplate:"離職防止と従業員満足度向上",risksTemplate:"人件費増加、他社員との公平性",baseAmount:{min:3e4,max:15e4},baseBenefit:{min:30,max:70},priority:"normal",possibleNatures:["clear_good","tradeoff"],possibleTraps:[null],clueTemplates:[{field:"市場相場",observation:"同職種の市場給与は月額${amount}万円"},{field:"離職リスク",observation:"${name}の現在の離職リスクは${level}"}]},{category:"new_business",titleTemplate:"新規事業提案「${businessName}」",summaryTemplate:"${market}分野への新規参入を提案します。",benefitTemplate:"${years}年後に年商${amount}万円規模の事業に成長見込み",risksTemplate:"初期投資の回収リスク、市場の不確実性が高い",baseAmount:{min:3e6,max:15e6},baseBenefit:{min:60,max:100},priority:"high",possibleNatures:["gamble","long_term","tradeoff"],possibleTraps:["hidden_risk","fake_data"],clueTemplates:[{field:"市場規模",observation:"対象市場の規模は${amount}億円"},{field:"参入障壁",observation:"参入障壁は${level}と評価"},{field:"提案者の経験",observation:"${name}の該当分野での経験は${years}年"}],triggerCategories:["hiring","equipment","marketing"]},{category:"new_business",titleTemplate:"海外展開計画書",summaryTemplate:"${country}市場への進出を計画しています。",benefitTemplate:"新市場開拓による売上拡大",risksTemplate:"法規制、文化の違い、為替リスク",baseAmount:{min:5e6,max:2e7},baseBenefit:{min:50,max:95},priority:"high",possibleNatures:["gamble","long_term"],possibleTraps:["hidden_risk"],clueTemplates:[{field:"現地調査",observation:"現地パートナーの信頼度は${level}"},{field:"法規制",observation:"進出に必要な許認可は${count}件"}]},{category:"cost_cut",titleTemplate:"コスト削減提案書",summaryTemplate:"${area}のコストを${percent}%削減する施策を提案します。",benefitTemplate:"年間${amount}万円のコスト削減",risksTemplate:"品質低下、従業員のモチベーション低下",baseAmount:{min:0,max:5e5},baseBenefit:{min:30,max:80},priority:"normal",possibleNatures:["clear_good","tradeoff","clear_bad"],possibleTraps:["hidden_risk"],clueTemplates:[{field:"影響範囲",observation:"削減対象は${count}名に影響"},{field:"代替案",observation:"代替策の検討は${status}"}],triggerVisitorTypes:["complaint"]},{category:"cost_cut",titleTemplate:"外注費見直し提案",summaryTemplate:"外注先の見直しにより年間${amount}万円の削減を目指します。",benefitTemplate:"コスト効率の改善",risksTemplate:"外注先との関係悪化、品質リスク",baseAmount:{min:0,max:3e5},baseBenefit:{min:25,max:65},priority:"low",possibleNatures:["clear_good","tradeoff"],possibleTraps:[null],clueTemplates:[{field:"現行コスト",observation:"現在の外注費は月額${amount}万円"}]},{category:"partnership",titleTemplate:"${company}との業務提携提案",summaryTemplate:"${company}との${type}提携により、相互の強みを活かした事業展開を行います。",benefitTemplate:"技術力強化とシナジー効果",risksTemplate:"提携先への依存リスク、機密情報の管理",baseAmount:{min:1e6,max:5e6},baseBenefit:{min:50,max:90},priority:"high",possibleNatures:["clear_good","gamble","tradeoff"],possibleTraps:["conflict_interest","hidden_risk"],clueTemplates:[{field:"提携先評価",observation:"${company}の業界評判は${level}"},{field:"契約条件",observation:"利益配分は当社${percent}:先方${otherPercent}"},{field:"提携実績",observation:"${company}の過去の提携実績は${count}件"}],triggerCategories:["product_plan","new_business"]}],Co=[{condition:e=>e.money<3e6,label:"資金不足",amountMultiplier:.7,benefitMultiplier:1.2,extraClue:{field:"財務状況",observation:"会社の資金繰りが厳しい状況"}},{condition:e=>e.money>3e7,label:"余裕あり",amountMultiplier:1.3,benefitMultiplier:.9,extraClue:{field:"財務状況",observation:"潤沢な資金がある状況"}},{condition:e=>e.employees.length<5,label:"少人数",amountMultiplier:.8,benefitMultiplier:1.1,extraClue:{field:"組織規模",observation:"少人数体制での運営"}},{condition:e=>e.employees.length>20,label:"大規模組織",amountMultiplier:1.5,benefitMultiplier:1,extraClue:{field:"組織規模",observation:"大規模組織での管理コスト増大"}},{condition:e=>e.marketShare>20,label:"高シェア",amountMultiplier:1.2,benefitMultiplier:.8},{condition:e=>e.products.length===0,label:"製品なし",amountMultiplier:.9,benefitMultiplier:1.3,extraClue:{field:"事業状況",observation:"自社製品がまだ存在しない"}}],ya={hiring:"採用",budget:"予算",product_plan:"製品企画",marketing:"マーケティング",equipment:"設備投資",personnel_change:"人事異動",promotion:"昇進",training:"研修",salary_raise:"給与改定",new_business:"新規事業",cost_cut:"コスト削減",partnership:"提携"},ba={urgent:{emoji:"🔴",label:"緊急",color:"#e74c3c"},high:{emoji:"🟠",label:"高",color:"#e67e22"},normal:{emoji:"🟡",label:"通常",color:"#f1c40f"},low:{emoji:"🟢",label:"低",color:"#2ecc71"}},ei={inflated_cost:"水増し請求",embezzlement:"横領",incompetent_hire:"不適格人材",wasteful_spending:"無駄遣い",hidden_risk:"隠れたリスク",conflict_interest:"利益相反",fake_data:"データ偽装"},qu=[{triggerCategory:"hiring",triggerVerdict:"approve",resultCategory:"training",delayTurns:3,probability:.6,description:"新入社員研修計画が提出される"},{triggerCategory:"cost_cut",triggerVerdict:"approve",resultVisitorType:"complaint",delayTurns:2,probability:.5,description:"削減対象社員からの苦情"},{triggerCategory:"new_business",triggerVerdict:"approve",resultCategory:"hiring",delayTurns:2,probability:.7,description:"新規事業のための人材採用が必要に"},{triggerCategory:"new_business",triggerVerdict:"approve",resultCategory:"equipment",delayTurns:3,probability:.5,description:"新規事業用の設備投資が必要に"},{triggerCategory:"product_plan",triggerVerdict:"approve",resultCategory:"marketing",delayTurns:4,probability:.8,description:"新製品のマーケティング計画が必要に"},{triggerCategory:"equipment",triggerVerdict:"approve",resultCategory:"training",delayTurns:2,probability:.4,description:"新設備の操作研修が必要に"},{triggerCategory:"salary_raise",triggerVerdict:"reject",resultVisitorType:"complaint",delayTurns:1,probability:.7,description:"給与改定を却下された社員が不満を訴えに来る"},{triggerCategory:"promotion",triggerVerdict:"reject",resultVisitorType:"consultation",delayTurns:1,probability:.5,description:"昇進が見送られた社員がキャリア相談に来る"},{triggerCategory:"partnership",triggerVerdict:"approve",resultCategory:"product_plan",delayTurns:3,probability:.6,description:"提携先との共同製品企画が立ち上がる"}],Uu={visionary:{name:"先見の明",emoji:"🔮",description:"市場の変化を敏感に察知。long_term書類のヒントが多く表示される",effects:{clueBonus:"long_term"}},people_person:{name:"人たらし",emoji:"🤝",description:"人心掌握に長ける。訪問者対応の効果が+50%",effects:{visitorBonus:1.5}},analyst:{name:"分析家",emoji:"📊",description:"数字に強い。数値不整合の観察ポイントが追加される",effects:{clueBonus:"numbers"}},charismatic:{name:"カリスマ",emoji:"🌟",description:"圧倒的なカリスマ性。支持率の自然減衰が-0.1に軽減",effects:{approvalDecay:-.1}},strict:{name:"厳格",emoji:"⚔️",description:"規律を重んじる。罠の発見率+20%、ただし却下時のモチベ影響が大きい",effects:{trapDetectionBonus:.2,moraleImpact:1.5}},generous:{name:"寛大",emoji:"🎁",description:"部下に寛容。承認時のボーナスが大きいが、罠の発見が難しい",effects:{approveBonus:1.5,trapDetectionBonus:-.1}}},Ot={aggressive_hiring:{name:"積極採用",emoji:"👥",description:"人材を積極的に確保し、組織を拡大する",documentWeights:{hiring:2,training:1.5},alignmentCategories:["hiring","training"]},cost_reduction:{name:"コスト削減",emoji:"✂️",description:"無駄を排除し、利益率を高める",documentWeights:{cost_cut:2,budget:.7},alignmentCategories:["cost_cut"]},new_product:{name:"新製品開発",emoji:"🚀",description:"新製品を開発し、競争力を強化する",documentWeights:{product_plan:2,equipment:1.3},alignmentCategories:["product_plan"]},market_expansion:{name:"市場拡大",emoji:"🌍",description:"市場シェアの拡大を目指す",documentWeights:{marketing:2,new_business:1.5},alignmentCategories:["marketing","new_business"]},employee_welfare:{name:"従業員福利",emoji:"❤️",description:"従業員の満足度と定着率を高める",documentWeights:{salary_raise:1.5,training:1.5,equipment:1.3},alignmentCategories:["salary_raise","training"]},tech_innovation:{name:"技術革新",emoji:"💡",description:"最新技術への投資と革新を推進する",documentWeights:{equipment:2,product_plan:1.5,training:1.3},alignmentCategories:["equipment","product_plan"]},quality_improvement:{name:"品質向上",emoji:"🏆",description:"製品・サービスの品質を最優先にする",documentWeights:{product_plan:1.5,training:1.5},alignmentCategories:["product_plan","training"]},partnership:{name:"外部提携",emoji:"🤝",description:"外部企業との提携で事業を拡大する",documentWeights:{partnership:2.5},alignmentCategories:["partnership"]}};function Hu(e){return{approvalRating:60,stockPrice:1e3,decisionsCorrect:0,decisionsWrong:0,trapsDetected:0,trapsMissed:0,trait:e,consecutiveLowApproval:0,remandsThisWeek:0,investigationBudget:0,currentPolicy:null,quarterlyReview:null,gamblesRejected:0}}const q={approvalDecayPerTurn:-.3,charismaticDecay:-.1,lowApprovalThreshold:10,gameOverConsecutiveTurns:3,baseDocumentsPerTurn:2,documentsPerTurnGrowth:20,documentsPerEmployeeGrowth:10,maxDocumentsPerTurn:6,trapBaseRate:{easy:.1,normal:.15,hard:.25},trapGrowthPerTurn:.002,maxTrapRate:.35,natureDistribution:{clear_good:.3,clear_bad:.15,tradeoff:.25,gamble:.15,long_term:.15},approveGoodCeoBonus:{min:2,max:3},rejectGoodCeoPenalty:-2,rejectGoodMoralePenalty:-15,approveBadCeoPenalty:{min:-5,max:-15},rejectBadCeoBonus:{min:5,max:10},tradeoffCeoRange:{min:-1,max:2},gambleRejectPenalty:0,maxRemandsPerWeek:1,remandMoralePenalty:-3,remandCeoPenalty:-1,investigationCost:5e4,investigationDeadlineExtension:1,visitorBaseChance:.3,stockPriceBase:1e3,stockPriceMonthlyVariance:.05,maxDocumentHistory:50,maxVisitorHistory:20,quarterlyGrades:[{min:90,grade:"S",ceoBonus:10},{min:75,grade:"A",ceoBonus:5},{min:60,grade:"B",ceoBonus:2},{min:40,grade:"C",ceoBonus:0},{min:20,grade:"D",ceoBonus:-5},{min:0,grade:"F",ceoBonus:-10}],companyCultureDecay:-.1,scandalRiskDecay:-.5};let Wu=0;function Vu(){return`doc_${Date.now()}_${++Wu}`}function ce(e,t){return Math.floor(Math.random()*(t-e+1))+e}function Hn(e,t){return Math.random()*(t-e)+e}function ee(e){return e[Math.floor(Math.random()*e.length)]}function Gu(e){const t=new Map;if(["hiring","budget","product_plan","marketing","equipment","personnel_change","promotion","training","salary_raise","new_business","cost_cut","partnership"].forEach(i=>t.set(i,1)),e.employees.length<5&&(t.set("hiring",(t.get("hiring")||1)*2),t.set("personnel_change",(t.get("personnel_change")||1)*.3)),e.products.length===0&&t.set("product_plan",(t.get("product_plan")||1)*2.5),e.money<3e6&&(t.set("cost_cut",(t.get("cost_cut")||1)*2),t.set("new_business",(t.get("new_business")||1)*.5)),e.marketShare<5&&t.set("marketing",(t.get("marketing")||1)*1.5),e.ceo?.currentPolicy){const i=e.ceo.currentPolicy.focus;for(const o of i){const a=Ot[o];if(a)for(const[r,c]of Object.entries(a.documentWeights))t.set(r,(t.get(r)||1)*c)}}return t}function Yu(e){const t=Array.from(e.entries()),n=t.reduce((o,[,a])=>o+a,0);let i=Math.random()*n;for(const[o,a]of t)if(i-=a,i<=0)return o;return t[t.length-1][0]}function Ku(e){const t={...q.natureDistribution},n=e.difficulty||"normal";t.clear_bad=q.trapBaseRate[n]||.15,t.clear_bad=Math.min(q.maxTrapRate,t.clear_bad+e.turn*q.trapGrowthPerTurn);const i=Object.values(t).reduce((a,r)=>a+r,0);let o=Math.random()*i;for(const[a,r]of Object.entries(t))if(o-=r,o<=0)return a;return"clear_good"}function Qu(e,t){const n=e.employees.filter(r=>r.department===t);if(n.length>0&&Math.random()<.7){const r=ee(n),c={staff:"社員",senior:"主任",manager:"課長",director:"部長"};return{employeeId:r.id,name:r.name,position:c[r.position]||"社員"}}const i=["田中","鈴木","佐藤","高橋","伊藤","山本","中村","小林","加藤","吉田"],o=["太郎","一郎","健太","翔太","智子","美咲","愛子","優子","直樹","拓也"],a=["課長","部長","主任","係長"];return{employeeId:null,name:`${ee(i)} ${ee(o)}`,position:ee(a)}}function lt(e,t){let n=e;for(const[i,o]of Object.entries(t))n=n.replace(new RegExp(`\\$\\{${i}\\}`,"g"),String(o));return n}function En(e,t,n){const i=Fu.filter(Z=>Z.category===t);if(i.length===0)return En(e,"budget");const o=ee(i),a=Ku(e);let r=ce(o.baseAmount.min,o.baseAmount.max),c=ce(o.baseBenefit.min,o.baseBenefit.max);for(const Z of Co)Z.condition(e)&&(r=Math.floor(r*Z.amountMultiplier),c=Math.floor(c*Z.benefitMultiplier));const d=["開発","営業","企画","管理"],u=ee(d),v=Qu(e,u==="開発"?"development":u==="営業"?"sales":u==="企画"?"planning":"management"),f={department:u,name:v.name,position:v.position,count:ce(1,5),percent:ce(10,50),amount:Math.floor(r/1e4),quarter:`第${Math.ceil((e.month||1)/3)}`,months:ce(2,6),productName:ee(["AI分析ツール","クラウドCRM","セキュリティスイート","IoTプラットフォーム","業務自動化ツール"]),market:ee(["AI","クラウド","セキュリティ","IoT","DX"]),equipment:ee(["高性能サーバー","開発用PC","セキュリティ機器","ネットワーク機器","モニター"]),channel:ee(["Web広告","SNS","展示会","セミナー","PR"]),company:ee(["テックコープ","デジタルワークス","イノバテック","フューチャーテック"]),trainingName:ee(["リーダーシップ","プロジェクト管理","プログラミング","コミュニケーション"]),businessName:ee(["AIコンサル事業","クラウドSaaS事業","DX支援事業"]),type:ee(["技術","販売","資本"]),area:ee(["外注費","交通費","通信費","オフィス維持費"]),reason:ee(["緊急のシステム障害対応","重要顧客からの追加要求","市場環境の急変"]),fromDept:u,toDept:ee(d.filter(Z=>Z!==u)),fromPosition:"主任",toPosition:"課長",country:ee(["アメリカ","シンガポール","インド","ベトナム"]),ratio:Hn(.8,2.2).toFixed(1),timing:ee(["先週","昨日","本日朝"]),years:ce(1,3),rank:ce(1,20),score:ce(30,90),status:ee(["ポジティブ","ネガティブ","中立"]),grade:ee(["S","A","B","C"]),level:ee(["高い","中程度","低い"]),condition:ee(["売り手市場","買い手市場","横ばい"]),result:ee(["良好","普通","やや不十分"]),hours:ce(2,20),otherPercent:ce(30,60)};let y=null,$=r;a==="clear_bad"&&(y=ee(o.possibleTraps.filter(Z=>Z!==null))||"inflated_cost",$=Math.floor(r*Hn(1.3,2.5)),c=ce(0,20));const T=[];for(const Z of o.clueTemplates)Math.random()<.7&&T.push({field:lt(Z.field,f),observation:lt(Z.observation,f)});for(const Z of Co)Z.condition(e)&&Z.extraClue&&T.push(Z.extraClue);let L,A,D;a==="gamble"&&(L=ce(30,70)),a==="long_term"&&(A=Math.floor(r*Hn(1.5,4)),D=ce(6,16));let O=null;return o.priority==="urgent"?O=e.turn+1:o.priority==="high"?O=e.turn+3:Math.random()<.3&&(O=e.turn+ce(3,8)),{id:Vu(),category:t,priority:o.priority,title:lt(o.titleTemplate,f),department:u,submitter:v,summary:lt(o.summaryTemplate,f),details:{amount:r,expectedBenefit:lt(o.benefitTemplate,f),timeline:`${ce(1,6)}ヶ月`,risks:lt(o.risksTemplate,f),attachments:Math.random()<.5?["見積書.pdf","企画書.pdf"]:[]},nature:a,trap:y,clues:T,actualAmount:y?$:void 0,actualBenefit:c,gambleSuccessRate:L,longTermBenefit:A,longTermTurns:D,turnSubmitted:e.turn,deadline:O,verdict:null,resultApplied:!1,underInvestigation:!1}}function _a(e,t){const n=q,i=t??Math.min(n.maxDocumentsPerTurn,n.baseDocumentsPerTurn+Math.floor(e.turn/n.documentsPerTurnGrowth)+Math.floor((e.employees?.length||0)/n.documentsPerEmployeeGrowth)),o=Gu(e),a=[];for(let r=0;r<i;r++){const c=Yu(o);a.push(En(e,c))}return a}function Ju(e,t){const[n,i]=t.split(":"),o=i||"budget",a=[],r=ce(1,2);for(let c=0;c<r;c++){const d=En(e,o),u=e.employees.filter(v=>v.department===n);if(u.length>0){const v=u.reduce((f,y)=>{const $=y.abilities||{};return f+(($.technical||0)+($.sales||0)+($.planning||0)+($.management||0))/4},0)/u.length;d.actualBenefit=Math.floor(d.actualBenefit*(v/60))}else d.actualBenefit=Math.floor(d.actualBenefit*.5);a.push(d)}return a}function Xu(e,t,n){const i=e.documentQueue.find(a=>a.id===t);if(!i)return null;if(n==="remand")return e.ceo.remandsThisWeek>=q.maxRemandsPerWeek?{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:0,employeeMoraleChange:0,description:"今週の差し戻しは既に上限に達しています。"}:(e.ceo.remandsThisWeek++,i.verdict="remand",{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:q.remandCeoPenalty,employeeMoraleChange:q.remandMoralePenalty,description:"書類を差し戻しました。提出者のモチベーションが少し低下しました。"});if(n==="investigate")return e.money<q.investigationCost?{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:0,employeeMoraleChange:0,description:"調査費用が不足しています。"}:(i.underInvestigation=!0,i.verdict="investigate",i.deadline&&(i.deadline+=q.investigationDeadlineExtension),e.money-=q.investigationCost,e.ceo.investigationBudget+=q.investigationCost,{moneyChange:-5e4,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:0,employeeMoraleChange:0,description:`調査を指示しました（費用: ${Math.floor(q.investigationCost/1e4)}万円）。次のターンに結果が判明します。`});if(n==="hold")return i.verdict="hold",{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:0,employeeMoraleChange:-2,description:"書類を保留にしました。"};i.verdict=n;const o=ep(e,i,n);if(i.outcome=o,i.resultApplied=!0,e.documentQueue=e.documentQueue.filter(a=>a.id!==t),e.documentHistory.push(i),n==="approve"?e.documentStats.totalApproved++:e.documentStats.totalRejected++,e.documentStats.totalProcessed++,e.money+=o.moneyChange,e.marketShare=Math.max(0,Math.min(60,e.marketShare+o.marketShareChange)),e.brandPower=Math.max(0,Math.min(100,e.brandPower+o.brandPowerChange)),e.ceo.approvalRating=Math.max(0,Math.min(100,e.ceo.approvalRating+o.ceoApprovalChange)),i.submitter.employeeId){const a=e.employees.find(r=>r.id===i.submitter.employeeId);a&&(a.motivation=Math.max(10,Math.min(100,a.motivation+o.employeeMoraleChange)))}return i.nature==="clear_bad"&&(n==="reject"?(e.ceo.trapsDetected++,e.documentStats.trapsDetected++):(e.ceo.trapsMissed++,e.documentStats.trapsMissed++,e.scandalRisk=Math.min(100,(e.scandalRisk||0)+15))),i.nature==="clear_good"&&n==="approve"||i.nature==="clear_bad"&&n==="reject"?e.ceo.decisionsCorrect++:(i.nature==="clear_good"&&n==="reject"||i.nature==="clear_bad"&&n==="approve")&&e.ceo.decisionsWrong++,i.nature==="gamble"&&n==="reject"&&e.ceo.gamblesRejected++,tp(e,i,n),o}function ep(e,t,n){const a=(e.ceo?.trait||"analyst")==="generous"?1.5:1;if(n==="approve")switch(t.nature){case"clear_good":return{moneyChange:-t.details.amount,marketShareChange:t.actualBenefit>70?.3:.1,brandPowerChange:t.actualBenefit>80?1:0,ceoApprovalChange:ce(q.approveGoodCeoBonus.min,q.approveGoodCeoBonus.max)*a,employeeMoraleChange:5,description:`承認しました。${t.details.expectedBenefit}`};case"clear_bad":return{moneyChange:-(t.actualAmount||t.details.amount),marketShareChange:-.2,brandPowerChange:-1,ceoApprovalChange:ce(q.approveBadCeoPenalty.min,q.approveBadCeoPenalty.max),employeeMoraleChange:0,description:`承認しました。しかし後に${ei[t.trap||""]||"問題"}が発覚する可能性があります...`};case"tradeoff":const r=Math.random()<.5;return{moneyChange:-t.details.amount,marketShareChange:r?.2:-.1,brandPowerChange:0,ceoApprovalChange:ce(q.tradeoffCeoRange.min,q.tradeoffCeoRange.max),employeeMoraleChange:r?5:-5,description:r?"承認しました。施策は一定の成果を上げました。":"承認しました。期待した効果は限定的でした。"};case"gamble":const c=Math.random()*100<(t.gambleSuccessRate||50);return{moneyChange:c?Math.floor(t.details.amount*.5):-t.details.amount,marketShareChange:c?.5:-.2,brandPowerChange:c?2:-1,ceoApprovalChange:c?5:-3,employeeMoraleChange:c?10:-5,description:c?"大成功！投資が大きなリターンをもたらしました！":"残念ながら期待した結果は得られませんでした。"};case"long_term":return{moneyChange:-t.details.amount,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:-1,employeeMoraleChange:3,description:`承認しました。短期的にはコストですが、${t.longTermTurns||8}ターン後に効果が現れる見込みです。`}}switch(t.nature){case"clear_good":return{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:q.rejectGoodCeoPenalty,employeeMoraleChange:q.rejectGoodMoralePenalty,description:"却下しました。提出者のモチベーションが低下しました。"};case"clear_bad":return{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:ce(q.rejectBadCeoBonus.min,q.rejectBadCeoBonus.max),employeeMoraleChange:0,description:`却下しました。${ei[t.trap||""]||"不正"}を未然に防ぎました！`};case"tradeoff":return{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:-1,employeeMoraleChange:-5,description:"却下しました。機会損失の可能性がありますが、リスクも回避しました。"};case"gamble":return{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:q.gambleRejectPenalty,employeeMoraleChange:-3,description:"却下しました。安全策を取りました。"};case"long_term":return{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:0,employeeMoraleChange:-5,description:"却下しました。長期的な成長機会を見送りました。"}}return{moneyChange:0,marketShareChange:0,brandPowerChange:0,ceoApprovalChange:0,employeeMoraleChange:0,description:""}}function tp(e,t,n){for(const i of qu)i.triggerCategory===t.category&&i.triggerVerdict===n&&Math.random()<i.probability&&(e._pendingCausalEffects||(e._pendingCausalEffects=[]),e._pendingCausalEffects.push({triggerTurn:e.turn+i.delayTurns,resultCategory:i.resultCategory,resultVisitorType:i.resultVisitorType,sourceDocId:t.id,description:i.description}))}function np(e){const t=[],n=e.documentQueue.filter(i=>i.deadline&&i.deadline<=e.turn&&i.verdict===null&&!i.underInvestigation);for(const i of n){const o={moneyChange:0,marketShareChange:-.1,brandPowerChange:0,ceoApprovalChange:-3,employeeMoraleChange:-5,description:`「${i.title}」が期限切れになりました。対応の遅れが組織の士気に影響しています。`};i.verdict="hold",i.resultApplied=!0,i.outcome=o,e.documentQueue=e.documentQueue.filter(a=>a.id!==i.id),e.documentHistory.push(i),e.documentStats.totalProcessed++,e.ceo.approvalRating=Math.max(0,e.ceo.approvalRating+o.ceoApprovalChange),t.push(o)}return t}function ip(e){const t=e.documentQueue.filter(i=>i.underInvestigation&&i.verdict==="investigate"),n=[];for(const i of t)i.underInvestigation=!1,i.verdict=null,i.nature==="clear_bad"?(i.investigationResult=`調査の結果、${ei[i.trap||""]||"問題"}の疑いが確認されました。金額に${Math.floor(((i.actualAmount||0)-i.details.amount)/1e4)}万円の差異があります。`,i.clues.push({field:"調査報告",observation:i.investigationResult})):i.nature==="gamble"?(i.investigationResult=`調査の結果、成功確率は約${i.gambleSuccessRate}%と推定されます。${(i.gambleSuccessRate||50)>50?"比較的有望な案件です。":"リスクが高い案件です。"}`,i.clues.push({field:"調査報告",observation:i.investigationResult})):(i.investigationResult="調査の結果、特に問題は見つかりませんでした。書類の内容は概ね妥当です。",i.clues.push({field:"調査報告",observation:i.investigationResult})),n.push(i);return n}function op(e){if(!e._pendingCausalEffects)return{documents:[],visitorTypes:[]};const t=e._pendingCausalEffects.filter(o=>o.triggerTurn<=e.turn),n=[],i=[];for(const o of t){if(o.resultCategory){const a=En(e,o.resultCategory);a.triggeredBy=o.sourceDocId,n.push(a)}o.resultVisitorType&&i.push(o.resultVisitorType)}return e._pendingCausalEffects=e._pendingCausalEffects.filter(o=>o.triggerTurn>e.turn),{documents:n,visitorTypes:i}}function ap(e){const t=[];for(const n of e.documentHistory)if(n.nature==="long_term"&&n.verdict==="approve"&&n.longTermTurns&&n.longTermBenefit&&n.turnSubmitted+n.longTermTurns===e.turn){const o={moneyChange:n.longTermBenefit,marketShareChange:.5,brandPowerChange:2,ceoApprovalChange:5,employeeMoraleChange:5,description:`過去の投資「${n.title}」が実を結びました！+${Math.floor(n.longTermBenefit/1e4)}万円`};e.money+=o.moneyChange,e.marketShare=Math.min(60,e.marketShare+o.marketShareChange),e.brandPower=Math.min(100,e.brandPower+o.brandPowerChange),e.ceo.approvalRating=Math.min(100,e.ceo.approvalRating+o.ceoApprovalChange),t.push(o)}return t}function rp(e){e.documentHistory.length>q.maxDocumentHistory&&e.documentHistory.splice(0,e.documentHistory.length-q.maxDocumentHistory)}const sp=[{type:"consultation",titleTemplate:"${name}からの給与相談",descriptionTemplate:"${name}（${department}部・${position}）が給与について相談があると言っています。",dialogTemplates:["社長、お忙しいところ申し訳ありません。","実は、他社からオファーをいただいておりまして…","今の待遇について、ご検討いただけないでしょうか。"],responsesTemplate:[{text:"前向きに検討しよう。人事部と調整する。",tone:"supportive",effects:{visitorMoraleChange:20,ceoApprovalChange:1,moneyChange:-1e5}},{text:"今は厳しいが、業績次第で考える。",tone:"diplomatic",effects:{visitorMoraleChange:5,ceoApprovalChange:0}},{text:"他社のオファーがあるなら、そちらに行くのも一つの選択肢だ。",tone:"harsh",effects:{visitorMoraleChange:-20,ceoApprovalChange:-2,specialEffect:"increase_leave_risk"}}],weight:20,moods:["anxious","calm"],triggerCondition:e=>e.employees.some(t=>t.motivation<50)},{type:"consultation",titleTemplate:"${name}からの退職相談",descriptionTemplate:"${name}が退職を考えていると打ち明けに来ました。",dialogTemplates:["社長、ちょっとお時間いただけますか。","実は…退職を考えています。","この会社にはお世話になりましたが、新しい挑戦がしたいんです。"],responsesTemplate:[{text:"何か不満があるなら改善する。条件を聞かせてほしい。",tone:"supportive",effects:{visitorMoraleChange:15,ceoApprovalChange:1,specialEffect:"prevent_resignation"}},{text:"残念だが、君の決断を尊重する。引き継ぎを頼む。",tone:"neutral",effects:{visitorMoraleChange:0,ceoApprovalChange:0}},{text:"プロジェクトの途中で辞めるのは無責任じゃないか？",tone:"harsh",effects:{visitorMoraleChange:-25,ceoApprovalChange:-3,companyCultureChange:-5}}],weight:10,moods:["anxious","desperate"],triggerCondition:e=>e.employees.some(t=>t.motivation<30&&e.turn-(t.joinedTurn||1)>10)},{type:"report",titleTemplate:"${name}からの業務報告",descriptionTemplate:"${name}が${department}部の業務状況を報告しに来ました。",dialogTemplates:["社長、${department}部の進捗をご報告いたします。","現在のプロジェクトは${status}です。","チームメンバーは${condition}取り組んでいます。"],responsesTemplate:[{text:"良い報告だ。チームによろしく伝えてくれ。",tone:"supportive",effects:{visitorMoraleChange:10,ceoApprovalChange:1,companyCultureChange:2}},{text:"もう少し具体的な数字を出してくれないか。",tone:"neutral",effects:{visitorMoraleChange:-5,ceoApprovalChange:0}},{text:"スピードが遅い。もっとペースを上げるように。",tone:"harsh",effects:{visitorMoraleChange:-15,ceoApprovalChange:-1,companyCultureChange:-3}}],weight:25,moods:["calm","excited"]},{type:"proposal",titleTemplate:"${name}からのアイデア提案",descriptionTemplate:"${name}が新しいビジネスアイデアを持ってきました。",dialogTemplates:["社長、ちょっとアイデアがあるんですが聞いてもらえますか？","最近の市場動向を見ていて思いついたんですが…","うまくいけば、大きな利益になると思います！"],responsesTemplate:[{text:"面白い！企画書にまとめて提出してくれ。",tone:"supportive",effects:{visitorMoraleChange:25,ceoApprovalChange:2,companyCultureChange:3}},{text:"アイデアは悪くないが、リスクもある。もう少し検討してくれ。",tone:"diplomatic",effects:{visitorMoraleChange:5,ceoApprovalChange:0}},{text:"今はそんな余裕はない。本業に集中してくれ。",tone:"harsh",effects:{visitorMoraleChange:-20,ceoApprovalChange:-1,companyCultureChange:-5}}],weight:15,moods:["excited","calm"],triggerCondition:e=>e.employees.some(t=>t.personalityKey==="creative"||t.personalityKey==="intuitive")},{type:"complaint",titleTemplate:"${name}からのハラスメント報告",descriptionTemplate:"${name}が職場でのハラスメントについて報告に来ました。",dialogTemplates:["社長、深刻な話なのですが…","実は、${targetName}からハラスメントを受けています。","このまま放置すると、他の社員にも影響が出ると思います。"],responsesTemplate:[{text:"重大な問題だ。すぐに調査チームを立ち上げる。",tone:"supportive",effects:{visitorMoraleChange:20,ceoApprovalChange:3,companyCultureChange:5,moneyChange:-2e5}},{text:"双方の話を聞いてから判断する。",tone:"diplomatic",effects:{visitorMoraleChange:5,ceoApprovalChange:0}},{text:"当事者同士で解決してくれないか。",tone:"harsh",effects:{visitorMoraleChange:-30,ceoApprovalChange:-5,companyCultureChange:-10,specialEffect:"trigger_scandal"}}],weight:5,moods:["anxious","angry"]},{type:"crisis",titleTemplate:"人事部からの緊急報告",descriptionTemplate:"競合他社による社員引き抜きの動きが検知されました。",dialogTemplates:["社長、緊急のご報告があります。","${company}が当社の${count}名に接触しているようです。","特に${name}は引き抜きのリスクが高い状況です。"],responsesTemplate:[{text:"待遇改善と引き止め面談を実施する。",tone:"supportive",effects:{visitorMoraleChange:10,ceoApprovalChange:2,moneyChange:-5e5,specialEffect:"prevent_poaching"}},{text:"状況を注視しつつ、代替人材の確保も進めよう。",tone:"diplomatic",effects:{visitorMoraleChange:0,ceoApprovalChange:0}},{text:"去る者は追わず。残りたい者だけ残ればいい。",tone:"harsh",effects:{visitorMoraleChange:-15,ceoApprovalChange:-3,companyCultureChange:-5}}],weight:10,moods:["anxious","desperate"]},{type:"crisis",titleTemplate:"匿名の内部告発",descriptionTemplate:"社内の不正に関する匿名の告発がありました。",dialogTemplates:["社長、匿名の内部通報が届きました。","${department}部の経費処理に不審な点があるとのことです。","早急な対応が必要です。"],responsesTemplate:[{text:"外部監査を入れて徹底的に調べろ。",tone:"supportive",effects:{visitorMoraleChange:5,ceoApprovalChange:5,moneyChange:-3e5,specialEffect:"reduce_scandal_risk"}},{text:"内部で静かに調査を進めよう。",tone:"diplomatic",effects:{visitorMoraleChange:0,ceoApprovalChange:1,specialEffect:"partial_reduce_scandal"}},{text:"匿名の告発は信用できない。保留だ。",tone:"harsh",effects:{visitorMoraleChange:-10,ceoApprovalChange:-5,specialEffect:"increase_scandal_risk"}}],weight:5,moods:["calm","anxious"],triggerCondition:e=>(e.scandalRisk||0)>60},{type:"consultation",titleTemplate:"${name}からのキャリア相談",descriptionTemplate:"${name}が今後のキャリアパスについて相談に来ました。",dialogTemplates:["社長、少しお時間よろしいでしょうか。","自分の将来のキャリアについて考えているんですが…","この会社で成長できる道はあるでしょうか？"],responsesTemplate:[{text:"君の成長を全力でサポートする。具体的なプランを一緒に考えよう。",tone:"supportive",effects:{visitorMoraleChange:25,ceoApprovalChange:2,companyCultureChange:3}},{text:"まずは今の業務で結果を出してから考えよう。",tone:"neutral",effects:{visitorMoraleChange:-5,ceoApprovalChange:0}},{text:"自分で考えるのが大事だ。もっと主体性を持ってくれ。",tone:"harsh",effects:{visitorMoraleChange:-15,ceoApprovalChange:-1}}],weight:10,moods:["calm","anxious"]}],cp=[{triggerVerdict:"approve",triggerCategory:"cost_cut",template:{type:"complaint",titleTemplate:"${name}からの抗議",descriptionTemplate:"コスト削減施策の影響を受けた${name}が抗議に来ました。",dialogTemplates:["社長、先日のコスト削減の件ですが…","正直、現場は大変なことになっています。","もう少し現場の声を聞いてほしいんです。"],responsesTemplate:[{text:"申し訳ない。現場の負担を軽減する方法を考えよう。",tone:"supportive",effects:{visitorMoraleChange:15,ceoApprovalChange:1,moneyChange:-1e5}},{text:"会社全体のために必要な判断だった。理解してほしい。",tone:"diplomatic",effects:{visitorMoraleChange:0,ceoApprovalChange:0}},{text:"経営判断に口出しするな。",tone:"harsh",effects:{visitorMoraleChange:-25,ceoApprovalChange:-3,companyCultureChange:-5}}],weight:0,moods:["angry","anxious"]}},{triggerVerdict:"approve",triggerCategory:"new_business",template:{type:"report",titleTemplate:"新規事業チームからの報告",descriptionTemplate:"新規事業の担当チームが意気込んで中間報告に来ました。",dialogTemplates:["社長、新規事業の件でご報告です！","チーム一丸となって取り組んでいます！","良い成果が出始めています。"],responsesTemplate:[{text:"素晴らしい！このまま頑張ってくれ。",tone:"supportive",effects:{visitorMoraleChange:20,ceoApprovalChange:2,companyCultureChange:3}},{text:"期待している。引き続き数字で報告してくれ。",tone:"neutral",effects:{visitorMoraleChange:5,ceoApprovalChange:1}}],weight:0,moods:["excited"]}},{triggerVerdict:"approve",triggerCategory:"hiring",template:{type:"report",titleTemplate:"新メンバー紹介の報告",descriptionTemplate:"採用された新メンバーの配属が完了し、上司が報告に来ました。",dialogTemplates:["社長、先日承認いただいた採用の件ですが…","新メンバーが無事に着任しました。","チームに馴染んできています。"],responsesTemplate:[{text:"良かった。しっかり育ててやってくれ。",tone:"supportive",effects:{visitorMoraleChange:10,ceoApprovalChange:1,companyCultureChange:2}},{text:"了解。成果を期待している。",tone:"neutral",effects:{visitorMoraleChange:5,ceoApprovalChange:0}}],weight:0,moods:["calm","excited"]}}],So={calm:{emoji:"😐",label:"冷静"},anxious:{emoji:"😰",label:"不安"},angry:{emoji:"😠",label:"怒り"},excited:{emoji:"😄",label:"興奮"},desperate:{emoji:"😱",label:"切迫"}};let lp=0;function dp(){return`vis_${Date.now()}_${++lp}`}function Te(e){return e[Math.floor(Math.random()*e.length)]}function Wn(e,t){let n=e;for(const[i,o]of Object.entries(t))n=n.replace(new RegExp(`\\$\\{${i}\\}`,"g"),String(o));return n}function up(e,t){const n=e.employees||[];if(t.type==="consultation"&&t.triggerCondition){const r=n.find(c=>c.motivation<50);if(r){const c={staff:"社員",senior:"主任",manager:"課長",director:"部長"},d={development:"開発",sales:"営業",planning:"企画",management:"管理"};return{employeeId:r.id,name:r.name,position:c[r.position]||"社員",department:d[r.department]||"開発",personalityKey:r.personalityKey}}}if(n.length>0&&Math.random()<.6){const r=Te(n),c={staff:"社員",senior:"主任",manager:"課長",director:"部長"},d={development:"開発",sales:"営業",planning:"企画",management:"管理"};return{employeeId:r.id,name:r.name,position:c[r.position]||"社員",department:d[r.department]||"開発",personalityKey:r.personalityKey}}const i=["田中 太郎","鈴木 智子","佐藤 健太","高橋 美咲","伊藤 直樹","山本 愛子"],o=["課長","部長","主任"],a=["開発","営業","企画","管理"];return{employeeId:null,name:Te(i),position:Te(o),department:Te(a)}}function pp(e,t){if(!t&&Math.random()>q.visitorBaseChance)return null;let n=null;if(t){const u=cp.find(v=>v.template.type===t);u&&(n=u.template)}if(!n){const u=sp.filter(y=>!(y.triggerCondition&&!y.triggerCondition(e)));if(u.length===0)return null;const v=u.reduce((y,$)=>y+$.weight,0);let f=Math.random()*v;for(const y of u)if(f-=y.weight,f<=0){n=y;break}n||(n=u[u.length-1])}const i=up(e,n),o=Te(n.moods),a={name:i.name,department:i.department,position:i.position,status:Te(["順調","遅延気味","前倒し"]),condition:Te(["意欲的に","淡々と","苦戦しながら"]),company:Te(["テックコープ","デジタルワークス","イノバテック"]),count:Math.floor(Math.random()*3)+1,targetName:Te(["佐藤 健太","高橋 美咲","山本 愛子"])},r=n.responsesTemplate.map((u,v)=>({id:`resp_${v}`,text:u.text,tone:u.tone,effects:{...u.effects}}));if(e.ceo?.trait==="people_person")for(const u of r)u.tone==="supportive"&&(u.effects.visitorMoraleChange=Math.floor(u.effects.visitorMoraleChange*1.5),u.effects.ceoApprovalChange=Math.floor((u.effects.ceoApprovalChange||0)*1.5));let c,d;if(e.documentQueue&&e.documentQueue.length>0&&Math.random()<.3){const u=Te(e.documentQueue);d=u.id,u.nature==="clear_bad"?c={field:"訪問者の発言",observation:`${i.name}が「${u.title}」について「あの案件、ちょっと気になる点がある」と漏らした`}:c={field:"訪問者の発言",observation:`${i.name}が「${u.title}」について「あれは良い案だと思う」と述べた`}}return{id:dp(),type:n.type,visitor:{employeeId:i.employeeId,name:i.name,position:i.position,department:i.department,mood:o,personalityKey:i.personalityKey},title:Wn(n.titleTemplate,a),description:Wn(n.descriptionTemplate,a),dialogLines:n.dialogTemplates.map(u=>Wn(u,a)),responses:r,resolved:!1,relatedDocumentId:d,documentClueToAdd:c}}function mp(e,t,n){const i=e.currentVisitor?.id===t?e.currentVisitor:null;if(!i)return null;const o=i.responses.find(r=>r.id===n);if(!o)return null;i.resolved=!0,i.chosenResponseId=n;const a=o.effects;if(a.ceoApprovalChange&&(e.ceo.approvalRating=Math.max(0,Math.min(100,e.ceo.approvalRating+a.ceoApprovalChange))),a.companyCultureChange&&(e.companyCulture=Math.max(0,Math.min(100,(e.companyCulture||50)+a.companyCultureChange))),a.moneyChange&&(e.money+=a.moneyChange),i.visitor.employeeId&&a.visitorMoraleChange){const r=e.employees.find(c=>c.id===i.visitor.employeeId);r&&(r.motivation=Math.max(10,Math.min(100,r.motivation+a.visitorMoraleChange)))}if(a.specialEffect&&fp(e,a.specialEffect,i),i.documentClueToAdd&&i.relatedDocumentId){const r=e.documentQueue.find(c=>c.id===i.relatedDocumentId);r&&r.clues.push(i.documentClueToAdd)}return e.visitorHistory.push({...i}),e.currentVisitor=null,{outcome:`${o.tone==="supportive"?"好意的":o.tone==="harsh"?"厳しい":"中立的"}な対応をしました。`,effects:a}}function fp(e,t,n){switch(t){case"prevent_resignation":if(n.visitor.employeeId){const i=e.employees.find(o=>o.id===n.visitor.employeeId);i&&(i.motivation=Math.max(i.motivation,50))}break;case"increase_leave_risk":if(n.visitor.employeeId){const i=e.employees.find(o=>o.id===n.visitor.employeeId);i&&(i.leaveProbability=(i.leaveProbability||0)+.3)}break;case"trigger_scandal":e.scandalRisk=Math.min(100,(e.scandalRisk||0)+20);break;case"reduce_scandal_risk":e.scandalRisk=Math.max(0,(e.scandalRisk||0)-30);break;case"partial_reduce_scandal":e.scandalRisk=Math.max(0,(e.scandalRisk||0)-10);break;case"increase_scandal_risk":e.scandalRisk=Math.min(100,(e.scandalRisk||0)+15);break;case"prevent_poaching":e.employees.forEach(i=>{i.motivation=Math.min(100,(i.motivation||50)+5)});break}}function gp(e){e.visitorHistory.length>q.maxVisitorHistory&&e.visitorHistory.splice(0,e.visitorHistory.length-q.maxVisitorHistory)}function hp(e){if(!e.ceo)return;const n=e.ceo.trait==="charismatic"?q.charismaticDecay:q.approvalDecayPerTurn;e.ceo.approvalRating=Math.max(0,Math.min(100,e.ceo.approvalRating+n)),e.companyCulture=Math.max(0,Math.min(100,(e.companyCulture||50)+q.companyCultureDecay)),e.scandalRisk=Math.max(0,(e.scandalRisk||0)+q.scandalRiskDecay),e.ceo.approvalRating<q.lowApprovalThreshold?e.ceo.consecutiveLowApproval++:e.ceo.consecutiveLowApproval=0}function vp(e){if(!e.ceo)return 1e3;const t=q.stockPriceBase,n=1+(e.marketShare||0)/100,i=1+(e.brandPower||0)/100,o=e.ceo.approvalRating/50;let a=Math.floor(t*n*i*o);const r=(Math.random()*2-1)*q.stockPriceMonthlyVariance;return a=Math.floor(a*(1+r)),e.ceo.stockPrice=Math.max(100,a),e.ceo.stockPrice}function yp(e){if(!e.ceo)return null;const t=e.monthlyRevenue*3,n=(e.employees||[]).reduce((v,f)=>v+(f.salary||0),0)*3,i=t-n,o=(e.employees||[]).length>0?Math.floor((e.employees||[]).reduce((v,f)=>v+(f.motivation||50),0)/e.employees.length):50;let a=50;if(e.ceo.currentPolicy){const f=e.ceo.currentPolicy.focus.flatMap($=>Ot[$]?.alignmentCategories||[]),y=e.documentHistory.filter($=>$.turnSubmitted>e.turn-12&&$.verdict==="approve");if(y.length>0){const $=y.filter(T=>f.includes(T.category)).length;a=Math.floor($/y.length*100)}}const r=Math.floor((i>0?30:0)+o/100*30+a/100*20+e.ceo.approvalRating/100*20);let c="F",d=q.quarterlyGrades[q.quarterlyGrades.length-1].ceoBonus;for(const v of q.quarterlyGrades)if(r>=v.min){c=v.grade,d=v.ceoBonus;break}e.ceo.approvalRating=Math.max(0,Math.min(100,e.ceo.approvalRating+d));const u={revenue:t,profit:i,employeeSatisfaction:o,policyAlignment:a,grade:c};return e.ceo.quarterlyReview=u,u}function bp(e,t){e.ceo&&(e.ceo.currentPolicy={focus:t.slice(0,3),setAtTurn:e.turn})}function _p(e,t,n){e.pendingDirectives||(e.pendingDirectives=[]),e.pendingDirectives.push(`${t}:${n}`)}function wp(e){return e.ceo?e.ceo.consecutiveLowApproval>=q.gameOverConsecutiveTurns?"取締役会により社長を解任されました。支持率の回復に失敗しました。":e.money<0?"経営破綻しました。資金が枯渇しました。":null:null}function $p(e){e.ceo&&(e.ceo.remandsThisWeek=0)}function xp(e){return e.month%3===1&&e.week===1}const kp=on.LOAN_INTEREST_RATE;function Cp(){const e=N();let t=0;const n=dt.difficultyMultipliers[e.difficulty||"normal"],i=[];e.products.forEach(d=>{let u=1;const v=e.employees.filter(T=>T.personalityKey==="charismatic").length;v>0&&(u*=1+v*.25),u*=1+e.marketShare*dt.economy.marketShareRevenueBonus,u*=1+e.brandPower*dt.economy.brandPowerRevenueBonus,u*=n.revenueMultiplier;const f=dt.economy.productRevenueBase,y=d.quality*dt.economy.productRevenueMultiplier,$=Math.floor((f+y)*u);d.sales+=$,t+=$,i.push({name:d.name,revenue:$}),`${d.name}`});const o=e.employees.reduce((d,u)=>d+u.salary,0),a=e.debt>0?Math.floor(e.debt*kp):0;e.monthlyRevenue=t,e.revenueHistory.push(t);const r=t-o-a;e.money+=r;const c=e.money<0;return c&&(e.isBankrupt=!0),{revenue:t,salaryTotal:o,interest:a,profit:r,isBankrupt:c,productRevenues:i}}function Sp(e){if(!e.ceo)return"";const t=e.ceo,n=Uu[t.trait],i=t.approvalRating>60?"#2ecc71":t.approvalRating>30?"#f1c40f":"#e74c3c",o=t.currentPolicy?t.currentPolicy.focus.map(a=>`${Ot[a].emoji}${Ot[a].name}`).join(" "):"未設定";return`
    <div class="ceo-kpi-bar">
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">支持率</span>
        <div class="ceo-kpi-bar-wrap">
          <div class="ceo-kpi-bar-fill" style="width:${t.approvalRating}%;background:${i}"></div>
        </div>
        <span class="ceo-kpi-value" style="color:${i}">${Math.floor(t.approvalRating)}%</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">株価</span>
        <span class="ceo-kpi-value">¥${t.stockPrice.toLocaleString()}</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">資金</span>
        <span class="ceo-kpi-value">${Math.floor(e.money/1e4).toLocaleString()}万</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">社員</span>
        <span class="ceo-kpi-value">${e.employees.length}名</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">シェア</span>
        <span class="ceo-kpi-value">${(e.marketShare||0).toFixed(1)}%</span>
      </div>
      <div class="ceo-kpi-item">
        <span class="ceo-kpi-label">${e.year}年${e.month}月 第${e.week}週</span>
        <span class="ceo-kpi-value">${n.emoji} ${n.name}</span>
      </div>
      <div class="ceo-kpi-policy">
        <span class="ceo-kpi-label">方針</span>
        <span class="ceo-kpi-value">${o}</span>
      </div>
    </div>
  `}function Tp(e){if(!e.ceo?.quarterlyReview)return"";const t=e.ceo.quarterlyReview;return`
    <div class="quarterly-review-modal">
      <h3>📊 四半期業績レビュー</h3>
      <div class="quarterly-grade" style="color:${{S:"#ffd700",A:"#2ecc71",B:"#3498db",C:"#f1c40f",D:"#e67e22",F:"#e74c3c"}[t.grade]||"#666"}">
        ${t.grade}
      </div>
      <div class="quarterly-details">
        <div class="quarterly-item">
          <span>売上</span>
          <span>${Math.floor(t.revenue/1e4).toLocaleString()}万円</span>
        </div>
        <div class="quarterly-item">
          <span>利益</span>
          <span style="color:${t.profit>=0?"#2ecc71":"#e74c3c"}">${Math.floor(t.profit/1e4).toLocaleString()}万円</span>
        </div>
        <div class="quarterly-item">
          <span>社員満足度</span>
          <span>${t.employeeSatisfaction}%</span>
        </div>
        <div class="quarterly-item">
          <span>方針整合度</span>
          <span>${t.policyAlignment}%</span>
        </div>
      </div>
    </div>
  `}function Ep(e){const t=Object.entries(Ot),n=e.ceo?.currentPolicy?.focus||[];return`
    <div class="policy-selection">
      <h3>🎯 経営方針を選択してください（2〜3個）</h3>
      <p style="color:#666;font-size:13px;margin-bottom:16px;">方針に沿った書類の承認でボーナスが得られます。方針は書類の発生頻度にも影響します。</p>
      <div class="policy-grid">
        ${t.map(([i,o])=>`
          <div class="policy-option ${n.includes(i)?"selected":""}"
               onclick="togglePolicyFocus('${i}')" data-policy="${i}">
            <div class="policy-emoji">${o.emoji}</div>
            <div class="policy-name">${o.name}</div>
            <div class="policy-desc">${o.description}</div>
          </div>
        `).join("")}
      </div>
      <div style="text-align:center;margin-top:16px;">
        <button class="btn desk-btn" onclick="confirmPolicySelection()">方針を決定</button>
      </div>
    </div>
  `}function Ap(e){return`
    <div class="directive-panel">
      <h3>📢 部門への指示</h3>
      <p style="color:#666;font-size:13px;margin-bottom:12px;">指示を出すと、次のターンに対応する書類が提出されます。</p>
      ${[{key:"development",name:"開発部",emoji:"💻",directives:[{type:"product_plan",label:"新製品企画を出させる"},{type:"equipment",label:"技術調査を指示"}]},{key:"sales",name:"営業部",emoji:"📈",directives:[{type:"hiring",label:"採用計画を提出させる"},{type:"marketing",label:"マーケティング施策を指示"}]},{key:"planning",name:"企画部",emoji:"💡",directives:[{type:"new_business",label:"新規事業案を募集"},{type:"partnership",label:"提携先を調査させる"}]},{key:"management",name:"管理部",emoji:"📊",directives:[{type:"cost_cut",label:"コスト見直しを指示"},{type:"budget",label:"予算報告を提出させる"}]}].map(n=>{const i=(e.employees||[]).filter(o=>o.department===n.key).length;return`
          <div class="directive-dept">
            <div class="directive-dept-header">
              ${n.emoji} ${n.name} <span style="color:#999;font-size:12px;">(${i}名)</span>
            </div>
            <div class="directive-actions">
              ${n.directives.map(o=>`
                <button class="btn desk-btn-small" onclick="issueDirectiveAction('${n.key}','${o.type}')">
                  ${o.label}
                </button>
              `).join("")}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function j(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Mp(e){const t=So[e.visitor.mood]||So.calm;return`
    <div class="visitor-dialog">
      <div class="visitor-header">
        <div class="visitor-icon">${t.emoji}</div>
        <div class="visitor-info">
          <div class="visitor-name">${j(e.visitor.name)}</div>
          <div class="visitor-meta">${j(e.visitor.department)}部・${j(e.visitor.position)} | ${t.label}</div>
        </div>
      </div>

      <div class="visitor-title">${j(e.title)}</div>

      <div class="visitor-dialog-lines">
        ${e.dialogLines.map(n=>`
          <div class="visitor-dialog-line">
            <span class="dialog-speaker">${j(e.visitor.name)}:</span>
            <span class="dialog-text">「${j(n)}」</span>
          </div>
        `).join("")}
      </div>

      ${e.documentClueToAdd?`
        <div class="visitor-clue-hint">
          <span>💡</span>
          <span>この訪問者は未処理の書類に関する情報を持っているようです。</span>
        </div>
      `:""}

      <div class="visitor-responses">
        <h4>あなたの対応:</h4>
        ${e.responses.map(n=>{const i=n.tone==="supportive"?"😊":n.tone==="harsh"?"😤":n.tone==="diplomatic"?"🤔":"😐",o=n.tone==="supportive"?"好意的":n.tone==="harsh"?"厳しい":n.tone==="diplomatic"?"外交的":"中立";return`
            <button class="visitor-response-btn" onclick="respondToVisitor('${j(e.id)}','${j(n.id)}')">
              <span class="response-tone">${i} ${o}</span>
              <span class="response-text">${j(n.text)}</span>
            </button>
          `}).join("")}
      </div>
    </div>
  `}function jp(e,t){const n=[];if(t.ceoApprovalChange){const i=t.ceoApprovalChange>=0?"#2ecc71":"#e74c3c";n.push(`<span style="color:${i}">📊 支持率 ${t.ceoApprovalChange>=0?"+":""}${t.ceoApprovalChange}</span>`)}if(t.visitorMoraleChange){const i=t.visitorMoraleChange>=0?"#2ecc71":"#e74c3c";n.push(`<span style="color:${i}">😊 訪問者の気持ち ${t.visitorMoraleChange>=0?"+":""}${t.visitorMoraleChange}</span>`)}if(t.companyCultureChange){const i=t.companyCultureChange>=0?"#2ecc71":"#e74c3c";n.push(`<span style="color:${i}">🏢 社風 ${t.companyCultureChange>=0?"+":""}${t.companyCultureChange}</span>`)}if(t.moneyChange){const i=t.moneyChange>=0?"#2ecc71":"#e74c3c";n.push(`<span style="color:${i}">💰 ${t.moneyChange>=0?"+":""}${Math.floor(t.moneyChange/1e4)}万円</span>`)}return`
    <div class="visitor-result">
      <h4>訪問者対応完了</h4>
      <p>${j(e.visitor.name)}への対応が完了しました。</p>
      <div class="visitor-result-changes">
        ${n.join(" | ")}
      </div>
    </div>
  `}const an=globalThis,_i=an.ShadowRoot&&(an.ShadyCSS===void 0||an.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,wi=Symbol(),To=new WeakMap;let wa=class{constructor(t,n,i){if(this._$cssResult$=!0,i!==wi)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o;const n=this.t;if(_i&&t===void 0){const i=n!==void 0&&n.length===1;i&&(t=To.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&To.set(n,t))}return t}toString(){return this.cssText}};const Ip=e=>new wa(typeof e=="string"?e:e+"",void 0,wi),me=(e,...t)=>{const n=e.length===1?e[0]:t.reduce((i,o,a)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+e[a+1],e[0]);return new wa(n,e,wi)},zp=(e,t)=>{if(_i)e.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of t){const i=document.createElement("style"),o=an.litNonce;o!==void 0&&i.setAttribute("nonce",o),i.textContent=n.cssText,e.appendChild(i)}},Eo=_i?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let n="";for(const i of t.cssRules)n+=i.cssText;return Ip(n)})(e):e;const{is:Pp,defineProperty:Rp,getOwnPropertyDescriptor:Dp,getOwnPropertyNames:Op,getOwnPropertySymbols:Np,getPrototypeOf:Bp}=Object,qe=globalThis,Ao=qe.trustedTypes,Lp=Ao?Ao.emptyScript:"",Zp=qe.reactiveElementPolyfillSupport,Mt=(e,t)=>e,un={toAttribute(e,t){switch(t){case Boolean:e=e?Lp:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},$i=(e,t)=>!Pp(e,t),Mo={attribute:!0,type:String,converter:un,reflect:!1,useDefault:!1,hasChanged:$i};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),qe.litPropertyMetadata??(qe.litPropertyMetadata=new WeakMap);let ut=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=Mo){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,n);o!==void 0&&Rp(this.prototype,t,o)}}static getPropertyDescriptor(t,n,i){const{get:o,set:a}=Dp(this.prototype,t)??{get(){return this[n]},set(r){this[n]=r}};return{get:o,set(r){const c=o?.call(this);a?.call(this,r),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Mo}static _$Ei(){if(this.hasOwnProperty(Mt("elementProperties")))return;const t=Bp(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Mt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Mt("properties"))){const n=this.properties,i=[...Op(n),...Np(n)];for(const o of i)this.createProperty(o,n[o])}const t=this[Symbol.metadata];if(t!==null){const n=litPropertyMetadata.get(t);if(n!==void 0)for(const[i,o]of n)this.elementProperties.set(i,o)}this._$Eh=new Map;for(const[n,i]of this.elementProperties){const o=this._$Eu(n,i);o!==void 0&&this._$Eh.set(o,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const n=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const o of i)n.unshift(Eo(o))}else t!==void 0&&n.push(Eo(t));return n}static _$Eu(t,n){const i=n.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,n=this.constructor.elementProperties;for(const i of n.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zp(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,i){this._$AK(t,i)}_$ET(t,n){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(o!==void 0&&i.reflect===!0){const a=(i.converter?.toAttribute!==void 0?i.converter:un).toAttribute(n,i.type);this._$Em=t,a==null?this.removeAttribute(o):this.setAttribute(o,a),this._$Em=null}}_$AK(t,n){const i=this.constructor,o=i._$Eh.get(t);if(o!==void 0&&this._$Em!==o){const a=i.getPropertyOptions(o),r=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:un;this._$Em=o;const c=r.fromAttribute(n,a.type);this[o]=c??this._$Ej?.get(o)??c,this._$Em=null}}requestUpdate(t,n,i,o=!1,a){if(t!==void 0){const r=this.constructor;if(o===!1&&(a=this[t]),i??(i=r.getPropertyOptions(t)),!((i.hasChanged??$i)(a,n)||i.useDefault&&i.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,n,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:i,reflect:o,wrapped:a},r){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,r??n??this[t]),a!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(n=void 0),this._$AL.set(t,n)),o===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,a]of this._$Ep)this[o]=a;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[o,a]of i){const{wrapped:r}=a,c=this[o];r!==!0||this._$AL.has(o)||c===void 0||this.C(o,void 0,a,c)}}let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(n)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(n=>this._$ET(n,this[n]))),this._$EM()}updated(t){}firstUpdated(t){}};ut.elementStyles=[],ut.shadowRootOptions={mode:"open"},ut[Mt("elementProperties")]=new Map,ut[Mt("finalized")]=new Map,Zp?.({ReactiveElement:ut}),(qe.reactiveElementVersions??(qe.reactiveElementVersions=[])).push("2.1.2");const jt=globalThis,jo=e=>e,pn=jt.trustedTypes,Io=pn?pn.createPolicy("lit-html",{createHTML:e=>e}):void 0,$a="$lit$",Ze=`lit$${Math.random().toFixed(9).slice(2)}$`,xa="?"+Ze,Fp=`<${xa}>`,tt=document,Nt=()=>tt.createComment(""),Bt=e=>e===null||typeof e!="object"&&typeof e!="function",xi=Array.isArray,qp=e=>xi(e)||typeof e?.[Symbol.iterator]=="function",Vn=`[ 	
\f\r]`,Tt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,zo=/-->/g,Po=/>/g,Ge=RegExp(`>|${Vn}(?:([^\\s"'>=/]+)(${Vn}*=${Vn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ro=/'/g,Do=/"/g,ka=/^(?:script|style|textarea|title)$/i,Up=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),E=Up(1),nt=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),Oo=new WeakMap,Ke=tt.createTreeWalker(tt,129);function Ca(e,t){if(!xi(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Io!==void 0?Io.createHTML(t):t}const Hp=(e,t)=>{const n=e.length-1,i=[];let o,a=t===2?"<svg>":t===3?"<math>":"",r=Tt;for(let c=0;c<n;c++){const d=e[c];let u,v,f=-1,y=0;for(;y<d.length&&(r.lastIndex=y,v=r.exec(d),v!==null);)y=r.lastIndex,r===Tt?v[1]==="!--"?r=zo:v[1]!==void 0?r=Po:v[2]!==void 0?(ka.test(v[2])&&(o=RegExp("</"+v[2],"g")),r=Ge):v[3]!==void 0&&(r=Ge):r===Ge?v[0]===">"?(r=o??Tt,f=-1):v[1]===void 0?f=-2:(f=r.lastIndex-v[2].length,u=v[1],r=v[3]===void 0?Ge:v[3]==='"'?Do:Ro):r===Do||r===Ro?r=Ge:r===zo||r===Po?r=Tt:(r=Ge,o=void 0);const $=r===Ge&&e[c+1].startsWith("/>")?" ":"";a+=r===Tt?d+Fp:f>=0?(i.push(u),d.slice(0,f)+$a+d.slice(f)+Ze+$):d+Ze+(f===-2?c:$)}return[Ca(e,a+(e[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class Lt{constructor({strings:t,_$litType$:n},i){let o;this.parts=[];let a=0,r=0;const c=t.length-1,d=this.parts,[u,v]=Hp(t,n);if(this.el=Lt.createElement(u,i),Ke.currentNode=this.el.content,n===2||n===3){const f=this.el.content.firstChild;f.replaceWith(...f.childNodes)}for(;(o=Ke.nextNode())!==null&&d.length<c;){if(o.nodeType===1){if(o.hasAttributes())for(const f of o.getAttributeNames())if(f.endsWith($a)){const y=v[r++],$=o.getAttribute(f).split(Ze),T=/([.?@])?(.*)/.exec(y);d.push({type:1,index:a,name:T[2],strings:$,ctor:T[1]==="."?Vp:T[1]==="?"?Gp:T[1]==="@"?Yp:An}),o.removeAttribute(f)}else f.startsWith(Ze)&&(d.push({type:6,index:a}),o.removeAttribute(f));if(ka.test(o.tagName)){const f=o.textContent.split(Ze),y=f.length-1;if(y>0){o.textContent=pn?pn.emptyScript:"";for(let $=0;$<y;$++)o.append(f[$],Nt()),Ke.nextNode(),d.push({type:2,index:++a});o.append(f[y],Nt())}}}else if(o.nodeType===8)if(o.data===xa)d.push({type:2,index:a});else{let f=-1;for(;(f=o.data.indexOf(Ze,f+1))!==-1;)d.push({type:7,index:a}),f+=Ze.length-1}a++}}static createElement(t,n){const i=tt.createElement("template");return i.innerHTML=t,i}}function bt(e,t,n=e,i){if(t===nt)return t;let o=i!==void 0?n._$Co?.[i]:n._$Cl;const a=Bt(t)?void 0:t._$litDirective$;return o?.constructor!==a&&(o?._$AO?.(!1),a===void 0?o=void 0:(o=new a(e),o._$AT(e,n,i)),i!==void 0?(n._$Co??(n._$Co=[]))[i]=o:n._$Cl=o),o!==void 0&&(t=bt(e,o._$AS(e,t.values),o,i)),t}class Wp{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:n},parts:i}=this._$AD,o=(t?.creationScope??tt).importNode(n,!0);Ke.currentNode=o;let a=Ke.nextNode(),r=0,c=0,d=i[0];for(;d!==void 0;){if(r===d.index){let u;d.type===2?u=new Ht(a,a.nextSibling,this,t):d.type===1?u=new d.ctor(a,d.name,d.strings,this,t):d.type===6&&(u=new Kp(a,this,t)),this._$AV.push(u),d=i[++c]}r!==d?.index&&(a=Ke.nextNode(),r++)}return Ke.currentNode=tt,o}p(t){let n=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,n),n+=i.strings.length-2):i._$AI(t[n])),n++}}class Ht{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,i,o){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=bt(this,t,n),Bt(t)?t===F||t==null||t===""?(this._$AH!==F&&this._$AR(),this._$AH=F):t!==this._$AH&&t!==nt&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):qp(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==F&&Bt(this._$AH)?this._$AA.nextSibling.data=t:this.T(tt.createTextNode(t)),this._$AH=t}$(t){const{values:n,_$litType$:i}=t,o=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=Lt.createElement(Ca(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(n);else{const a=new Wp(o,this),r=a.u(this.options);a.p(n),this.T(r),this._$AH=a}}_$AC(t){let n=Oo.get(t.strings);return n===void 0&&Oo.set(t.strings,n=new Lt(t)),n}k(t){xi(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let i,o=0;for(const a of t)o===n.length?n.push(i=new Ht(this.O(Nt()),this.O(Nt()),this,this.options)):i=n[o],i._$AI(a),o++;o<n.length&&(this._$AR(i&&i._$AB.nextSibling,o),n.length=o)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){const i=jo(t).nextSibling;jo(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class An{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,i,o,a){this.type=1,this._$AH=F,this._$AN=void 0,this.element=t,this.name=n,this._$AM=o,this.options=a,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=F}_$AI(t,n=this,i,o){const a=this.strings;let r=!1;if(a===void 0)t=bt(this,t,n,0),r=!Bt(t)||t!==this._$AH&&t!==nt,r&&(this._$AH=t);else{const c=t;let d,u;for(t=a[0],d=0;d<a.length-1;d++)u=bt(this,c[i+d],n,d),u===nt&&(u=this._$AH[d]),r||(r=!Bt(u)||u!==this._$AH[d]),u===F?t=F:t!==F&&(t+=(u??"")+a[d+1]),this._$AH[d]=u}r&&!o&&this.j(t)}j(t){t===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Vp extends An{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===F?void 0:t}}class Gp extends An{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==F)}}class Yp extends An{constructor(t,n,i,o,a){super(t,n,i,o,a),this.type=5}_$AI(t,n=this){if((t=bt(this,t,n,0)??F)===nt)return;const i=this._$AH,o=t===F&&i!==F||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,a=t!==F&&(i===F||o);o&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Kp{constructor(t,n,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){bt(this,t)}}const Qp=jt.litHtmlPolyfillSupport;Qp?.(Lt,Ht),(jt.litHtmlVersions??(jt.litHtmlVersions=[])).push("3.3.2");const ae=(e,t,n)=>{const i=n?.renderBefore??t;let o=i._$litPart$;if(o===void 0){const a=n?.renderBefore??null;i._$litPart$=o=new Ht(t.insertBefore(Nt(),a),a,void 0,n??{})}return o._$AI(e),o};const It=globalThis;let de=class extends ut{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var n;const t=super.createRenderRoot();return(n=this.renderOptions).renderBefore??(n.renderBefore=t.firstChild),t}update(t){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ae(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return nt}};de._$litElement$=!0,de.finalized=!0,It.litElementHydrateSupport?.({LitElement:de});const Jp=It.litElementPolyfillSupport;Jp?.({LitElement:de});(It.litElementVersions??(It.litElementVersions=[])).push("4.2.2");const Xp={CHILD:2},em=e=>(...t)=>({_$litDirective$:e,values:t});class tm{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,n,i){this._$Ct=t,this._$AM=n,this._$Ci=i}_$AS(t,n){return this.update(t,n)}update(t,n){return this.render(...n)}}class ti extends tm{constructor(t){if(super(t),this.it=F,t.type!==Xp.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===F||t==null)return this._t=void 0,this.it=t;if(t===nt)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const n=[t];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}ti.directiveName="unsafeHTML",ti.resultType=1;const Sa=em(ti);function nm(e){const t=Sp(e),n=(e.documentQueue||[]).filter(a=>a.verdict===null||a.verdict==="hold").length,i=(e.documentQueue||[]).filter(a=>a.underInvestigation).length,o=1-(e.ceo?.remandsThisWeek||0);return`
    ${t}

    <div class="desk-tabs">
      <button class="desk-tab active" onclick="switchDeskTab('documents')">📥 書類(${n}件)</button>
      <button class="desk-tab" onclick="switchDeskTab('status')">📊 経営状況</button>
      <button class="desk-tab" onclick="switchDeskTab('employees')">👥 社員</button>
      <button class="desk-tab" onclick="switchDeskTab('directives')">📢 部門指示</button>
    </div>

    <div id="deskTabContent">
      ${Ta(e)}
    </div>

    <div class="desk-footer">
      <div class="desk-footer-info">
        差し戻し残: ${o}回/週 | 調査中: ${i}件
      </div>
      <button class="btn desk-btn next-turn-btn" onclick="nextTurn()">⏭️ 次の週へ</button>
      <button class="btn desk-btn" onclick="saveGame()">💾 保存</button>
      <button class="btn desk-btn" onclick="returnToMenu()" style="background:rgba(255,255,255,0.3)">🏠 メニュー</button>
    </div>
  `}function Ta(e){const t=e.documentQueue||[],n=t.filter(r=>r.verdict===null&&!r.underInvestigation),i=t.filter(r=>r.verdict==="hold"),o=t.filter(r=>r.underInvestigation);if(n.length===0&&i.length===0&&o.length===0)return`
      <div class="desk-empty">
        <div class="desk-empty-icon">📭</div>
        <p>処理すべき書類はありません</p>
        <p style="font-size:13px;color:#999;">「次の週へ」で新しい書類が届きます</p>
      </div>
    `;let a='<div class="document-stack">';return n.length>0&&(a+='<div class="doc-section-label">📋 未処理</div>',a+=n.map(r=>Gn(r,e)).join("")),i.length>0&&(a+='<div class="doc-section-label">⏸️ 保留中</div>',a+=i.map(r=>Gn(r,e)).join("")),o.length>0&&(a+='<div class="doc-section-label">🔍 調査中</div>',a+=o.map(r=>Gn(r,e,!0)).join("")),a+="</div>",a}function Gn(e,t,n=!1){const i=ba[e.priority],o=ya[e.category]||e.category;let a="";if(e.deadline){const r=e.deadline-t.turn;a=`<span class="doc-card-deadline" style="color:${r<=1?"#e74c3c":r<=3?"#e67e22":"#2ecc71"}">⏰ 残${r}T</span>`}return`
    <div class="doc-card ${n?"investigating":""}" onclick="openDocument('${j(e.id)}')">
      <div class="doc-card-priority" style="background:${i.color}">${i.emoji}</div>
      <div class="doc-card-content">
        <div class="doc-card-title">${j(e.title)}</div>
        <div class="doc-card-meta">
          ${j(e.department)}部 ${j(e.submitter.name)} | ${j(o)} | 💰${Math.floor(e.details.amount/1e4)}万円
        </div>
      </div>
      <div class="doc-card-right">
        ${a}
        ${n?'<span class="doc-card-badge">🔍調査中</span>':""}
      </div>
    </div>
  `}function im(e){const t=e.employees||[];return t.length===0?`
      <div class="desk-empty">
        <div class="desk-empty-icon">👥</div>
        <p>従業員がいません</p>
      </div>
    `:`<div class="desk-employee-list">${t.map(i=>{const o=le[i.personalityKey]||le.logical,a=ue[i.department]||{emoji:"💻",name:"開発部"},r=be[i.position]||{emoji:"👤",name:"スタッフ"},c=i.abilities||{technical:0,sales:0,planning:0,management:0};return`
      <div class="employee desk-employee-card">
        <div class="employee-header">
          <div class="employee-name">
            <span class="icon-badge">👤</span>
            ${j(i.name)}
          </div>
          <span class="personality">${o.emoji} ${j(o.name)}</span>
        </div>
        <div style="margin: 8px 0; display: flex; gap: 6px; flex-wrap: wrap;">
          <span class="department-badge">${a.emoji} ${j(a.name)}</span>
          <span class="position-badge">${r.emoji} ${j(r.name)}</span>
        </div>
        <div class="abilities">
          <div class="ability"><span class="ability-name">⚙️ 技術: ${Number(c.technical)||0}</span></div>
          <div class="ability"><span class="ability-name">💼 営業: ${Number(c.sales)||0}</span></div>
          <div class="ability"><span class="ability-name">📋 企画: ${Number(c.planning)||0}</span></div>
          <div class="ability"><span class="ability-name">👔 管理: ${Number(c.management)||0}</span></div>
        </div>
      </div>
    `}).join("")}</div>`}function om(e){const t=e.ceo;if(!t)return"<p>CEOデータがありません</p>";const n=t.decisionsCorrect+t.decisionsWrong>0?Math.floor(t.decisionsCorrect/(t.decisionsCorrect+t.decisionsWrong)*100):0;return`
    <div class="status-panel">
      <div class="status-section">
        <h4>📊 CEO成績</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>正確な判断</span><span>${t.decisionsCorrect}回</span>
          </div>
          <div class="status-item">
            <span>誤った判断</span><span>${t.decisionsWrong}回</span>
          </div>
          <div class="status-item">
            <span>正答率</span><span>${n}%</span>
          </div>
          <div class="status-item">
            <span>罠を発見</span><span>${t.trapsDetected}回</span>
          </div>
          <div class="status-item">
            <span>罠を見逃し</span><span>${t.trapsMissed}回</span>
          </div>
          <div class="status-item">
            <span>調査費用合計</span><span>${Math.floor(t.investigationBudget/1e4)}万円</span>
          </div>
        </div>
      </div>

      <div class="status-section">
        <h4>🏢 会社状況</h4>
        <div class="status-grid">
          <div class="status-item">
            <span>社風</span>
            <div class="status-bar-wrap">
              <div class="status-bar-fill" style="width:${e.companyCulture||50}%;background:#3498db"></div>
            </div>
            <span>${e.companyCulture||50}</span>
          </div>
          <div class="status-item">
            <span>スキャンダルリスク</span>
            <div class="status-bar-wrap">
              <div class="status-bar-fill" style="width:${e.scandalRisk||0}%;background:#e74c3c"></div>
            </div>
            <span>${e.scandalRisk||0}</span>
          </div>
          <div class="status-item">
            <span>処理書類数</span><span>${e.documentStats?.totalProcessed||0}</span>
          </div>
          <div class="status-item">
            <span>承認数</span><span>${e.documentStats?.totalApproved||0}</span>
          </div>
          <div class="status-item">
            <span>却下数</span><span>${e.documentStats?.totalRejected||0}</span>
          </div>
        </div>
      </div>

      ${t.quarterlyReview?`
        <div class="status-section">
          <h4>📋 直近の四半期評価</h4>
          <div class="quarterly-mini-grade">${t.quarterlyReview.grade}</div>
        </div>
      `:""}
    </div>
  `}const De={lawyer:{id:"lawyer",name:"弁護士",category:"legal",tier:"S",difficulty:5,duration:36,cost:5e6,spawnRate:.005,passRate:.4,salaryMultiplier:2.5,minSalary:8e6,abilityBonus:{legal:50,negotiation:40,analysis:30},requirements:[],effects:{legal_quality:1.5,contract_sales:1.2,company_trust:1.3},description:"法律実務の最高峰。契約・訴訟対応のスペシャリスト。"},cpa:{id:"cpa",name:"公認会計士",category:"accounting",tier:"S",difficulty:5,duration:36,cost:45e5,spawnRate:.003,passRate:.09,salaryMultiplier:2.3,minSalary:75e5,abilityBonus:{accounting:50,audit:45,analysis:40},requirements:["boki2"],effects:{financial_quality:1.6,audit_strength:1.8,ipo_ready:!0},description:"会計分野の最高峰。財務諸表監査・CFO候補。"},mba:{id:"mba",name:"MBA（海外トップ校）",category:"management",tier:"S",difficulty:5,duration:24,cost:15e6,spawnRate:.004,passRate:.2,salaryMultiplier:2.2,minSalary:7e6,abilityBonus:{management:50,strategy:45,leadership:40},requirements:["toeic730"],effects:{strategy_quality:1.5,new_business_success:1.3,global_expansion:1.5},description:"経営トップ層への最短ルート。グローバル視点を持つリーダー。"},tax_accountant:{id:"tax_accountant",name:"税理士",category:"accounting",tier:"S",difficulty:5,duration:40,cost:35e5,spawnRate:.006,passRate:.12,salaryMultiplier:2.1,minSalary:65e5,abilityBonus:{tax:50,accounting:45,consulting:40},requirements:["boki2"],effects:{tax_cost_reduction:.8,tax_audit_defense:1.5,tax_strategy:1.3},description:"税務のエキスパート。節税戦略と税務調査対応。"},social_insurance_labor_consultant:{id:"social_insurance_labor_consultant",name:"社会保険労務士",category:"hr",tier:"A",difficulty:4,duration:18,cost:8e5,spawnRate:.015,passRate:.065,salaryMultiplier:1.8,minSalary:5e6,abilityBonus:{hr:40,labor_law:45,administration:30},requirements:[],effects:{labor_trouble_prevention:1.8,hr_optimization:1.3,social_insurance_cost:.9},description:"労務管理のプロ。働き方改革で需要急増。"},sme_consultant:{id:"sme_consultant",name:"中小企業診断士",category:"consulting",tier:"A",difficulty:4,duration:18,cost:6e5,spawnRate:.02,passRate:.055,salaryMultiplier:1.75,minSalary:48e5,abilityBonus:{management:40,analysis:35,consulting:40},requirements:[],effects:{management_improvement:1.4,subsidy_success:1.5,consulting_revenue:1.3},description:"唯一の経営コンサル国家資格。経営改善提案のプロ。"},real_estate_appraiser:{id:"real_estate_appraiser",name:"不動産鑑定士",category:"real_estate",tier:"A",difficulty:4,duration:24,cost:12e5,spawnRate:.012,passRate:.15,salaryMultiplier:1.85,minSalary:52e5,abilityBonus:{real_estate:45,valuation:40,analysis:30},requirements:["takken"],effects:{real_estate_investment_accuracy:1.6,property_valuation:1.5,real_estate_business:!0},description:"不動産分野の最高峰。物件評価と投資判断のエキスパート。"},judicial_scrivener:{id:"judicial_scrivener",name:"司法書士",category:"legal",tier:"A",difficulty:4,duration:20,cost:9e5,spawnRate:.018,passRate:.045,salaryMultiplier:1.7,minSalary:45e5,abilityBonus:{legal:40,registration:45,administration:30},requirements:[],effects:{legal_cost_reduction:.7,registration_efficiency:1.5,company_establishment:!0},description:"登記・法的手続きのスペシャリスト。独立開業率高い。"},patent_attorney:{id:"patent_attorney",name:"弁理士",category:"ip",tier:"A",difficulty:4,duration:22,cost:1e6,spawnRate:.013,passRate:.07,salaryMultiplier:1.75,minSalary:48e5,abilityBonus:{ip:45,patent:50,technical:30},requirements:[],effects:{patent_application:!0,ip_strategy:1.5,product_ip_protection:1.5},description:"知財戦略のプロ。IT・製造業で高需要。"},first_class_architect:{id:"first_class_architect",name:"一級建築士",category:"architecture",tier:"A",difficulty:4,duration:20,cost:8e5,spawnRate:.025,passRate:.11,salaryMultiplier:1.65,minSalary:43e5,abilityBonus:{architecture:45,design:40,project_management:30},requirements:[],effects:{large_building_design:!0,design_quality:1.5,construction_project_success:1.3},description:"建築業界必須資格。大規模建築物の設計が可能。"},pmp:{id:"pmp",name:"PMP（プロジェクトマネージャー）",category:"management",tier:"B",difficulty:3,duration:6,cost:2e5,spawnRate:.035,passRate:.6,salaryMultiplier:1.5,minSalary:4e6,abilityBonus:{project_management:35,planning:40,leadership:30},requirements:[],effects:{project_success_rate:1.4,schedule_adherence:1.3,large_project_management:!0},description:"グローバル標準のPM資格。大規模プロジェクト管理のプロ。"},aws_pro:{id:"aws_pro",name:"AWS認定ソリューションアーキテクト Professional",category:"it",tier:"B",difficulty:4,duration:8,cost:3e5,spawnRate:.028,passRate:.15,salaryMultiplier:1.6,minSalary:45e5,abilityBonus:{cloud:45,architecture:40,technical:35},requirements:["aws_associate"],effects:{cloud_cost_reduction:.75,system_availability:1.4,cloud_migration:!0},description:"クラウド時代の必須スキル。インフラコスト削減のエキスパート。"},boki1:{id:"boki1",name:"日商簿記1級",category:"accounting",tier:"B",difficulty:4,duration:12,cost:15e4,spawnRate:.042,passRate:.1,salaryMultiplier:1.45,minSalary:38e5,abilityBonus:{accounting:35,analysis:25,finance:30},requirements:["boki2"],effects:{accounting_quality:1.35,financial_analysis:1.3,cpa_preparation:!0},description:"簿記の最高峰。公認会計士への足がかり。"},securities_analyst:{id:"securities_analyst",name:"証券アナリスト",category:"finance",tier:"B",difficulty:4,duration:18,cost:5e5,spawnRate:.03,passRate:.45,salaryMultiplier:1.55,minSalary:42e5,abilityBonus:{finance:40,analysis:35,investment:40},requirements:[],effects:{investment_accuracy:1.5,portfolio_optimization:1.4,financial_strategy:1.3},description:"金融業界で高評価。投資判断と財務戦略のプロ。"},applied_it:{id:"applied_it",name:"応用情報技術者",category:"it",tier:"B",difficulty:3,duration:6,cost:1e5,spawnRate:.045,passRate:.22,salaryMultiplier:1.35,minSalary:35e5,abilityBonus:{technical:30,system_design:25,architecture:20},requirements:["basic_it"],effects:{development_quality:1.3,technical_leadership:!0,it_strategist_preparation:!0},description:"IT技術者の登竜門。システム開発リーダー候補。"},gcp_pro:{id:"gcp_pro",name:"Google Cloud Professional Cloud Architect",category:"it",tier:"B",difficulty:4,duration:8,cost:3e5,spawnRate:.025,passRate:.2,salaryMultiplier:1.55,minSalary:42e5,abilityBonus:{cloud:40,architecture:35,technical:35},requirements:[],effects:{multi_cloud_strategy:1.4,system_scalability:1.4,google_cloud_integration:!0},description:"AWS対抗の主要クラウド資格。マルチクラウド戦略に必須。"},takken:{id:"takken",name:"宅地建物取引士",category:"real_estate",tier:"C",difficulty:3,duration:6,cost:8e4,spawnRate:.085,passRate:.16,salaryMultiplier:1.3,minSalary:32e5,abilityBonus:{real_estate:30,sales:20,legal:15},requirements:[],effects:{real_estate_transaction:!0,property_sales:1.2,real_estate_knowledge:1.3},description:"不動産業界必須資格。独占業務あり。"},fp1:{id:"fp1",name:"FP1級（CFP）",category:"finance",tier:"C",difficulty:3,duration:12,cost:3e5,spawnRate:.05,passRate:.12,salaryMultiplier:1.4,minSalary:36e5,abilityBonus:{finance:30,consulting:25,tax:20},requirements:["fp2"],effects:{financial_planning_quality:1.4,client_satisfaction:1.3,independent_fp:!0},description:"FP業務の最高峰。独立FPとして活躍可能。"},basic_it:{id:"basic_it",name:"基本情報技術者",category:"it",tier:"C",difficulty:2,duration:3,cost:5e4,spawnRate:.09,passRate:.45,salaryMultiplier:1.2,minSalary:3e6,abilityBonus:{technical:20,programming:15,it_literacy:15},requirements:[],effects:{development_participation:!0,it_basics:1.2,applied_it_preparation:!0},description:"IT系の入門資格。システム開発の基礎知識を証明。"},toeic900:{id:"toeic900",name:"TOEIC 900点以上",category:"language",tier:"C",difficulty:3,duration:12,cost:2e5,spawnRate:.06,passRate:.04,salaryMultiplier:1.35,minSalary:34e5,abilityBonus:{english:40,negotiation:15,international:25},requirements:["toeic730"],effects:{overseas_business:1.4,foreign_client_sales:1.3,global_expansion:1.3},description:"ビジネス英語の最高レベル。海外展開の要。"},sme_consultant_1st:{id:"sme_consultant_1st",name:"中小企業診断士1次試験合格",category:"consulting",tier:"C",difficulty:3,duration:8,cost:2e5,spawnRate:.07,passRate:.35,salaryMultiplier:1.25,minSalary:31e5,abilityBonus:{management:20,analysis:15,strategy:15},requirements:[],effects:{business_analysis:1.2,management_knowledge:1.2,sme_consultant_preparation:!0},description:"経営コンサルの基礎。診断士2次へのステップ。"},aws_associate:{id:"aws_associate",name:"AWS認定ソリューションアーキテクト Associate",category:"it",tier:"C",difficulty:2,duration:3,cost:1e5,spawnRate:.08,passRate:.65,salaryMultiplier:1.3,minSalary:33e5,abilityBonus:{cloud:20,infrastructure:20,technical:25},requirements:[],effects:{aws_infrastructure:!0,cloud_migration_support:1.2,infrastructure_cost_optimization:1.1},description:"クラウド資格の入門。AWSインフラ構築の基礎。"},it_strategist:{id:"it_strategist",name:"ITストラテジスト",category:"it",tier:"C",difficulty:3,duration:8,cost:15e4,spawnRate:.055,passRate:.15,salaryMultiplier:1.35,minSalary:35e5,abilityBonus:{it_strategy:30,business:25,planning:25},requirements:["applied_it"],effects:{it_strategy_quality:1.35,dx_promotion:1.4,system_planning:1.3},description:"IT経営の橋渡し役。DX推進リーダー。"},scrum_master:{id:"scrum_master",name:"スクラムマスター（CSM）",category:"management",tier:"C",difficulty:2,duration:2,cost:15e4,spawnRate:.075,passRate:.95,salaryMultiplier:1.25,minSalary:31e5,abilityBonus:{agile:30,facilitation:20,project_management:25},requirements:[],effects:{agile_development:!0,team_productivity:1.25,project_flexibility:1.3},description:"アジャイル時代の必須資格。チーム生産性向上のプロ。"},boki2:{id:"boki2",name:"日商簿記2級",category:"accounting",tier:"D",difficulty:2,duration:4,cost:5e4,spawnRate:.18,passRate:.25,salaryMultiplier:1.15,minSalary:28e5,abilityBonus:{accounting:15,administration:10,analysis:8},requirements:[],effects:{accounting_basics:1.2,financial_statement_reading:1.15,accounting_department:!0},description:"ビジネスパーソンの基本。会計業務の基礎。"},fp2:{id:"fp2",name:"FP2級（AFP）",category:"finance",tier:"D",difficulty:2,duration:4,cost:8e4,spawnRate:.15,passRate:.45,salaryMultiplier:1.18,minSalary:29e5,abilityBonus:{finance:15,consulting:10,insurance:10},requirements:[],effects:{financial_planning_basics:1.2,client_consultation:1.15,financial_product_sales:1.1},description:"FP業務の実務レベル。資産運用アドバイスの基礎。"},it_passport:{id:"it_passport",name:"ITパスポート",category:"it",tier:"D",difficulty:1,duration:2,cost:3e4,spawnRate:.12,passRate:.55,salaryMultiplier:1.1,minSalary:27e5,abilityBonus:{it_literacy:10,business:8,dx:8},requirements:[],effects:{it_literacy_basics:1.1,dx_participation:!0,business_efficiency:1.05},description:"IT系の最初の一歩。IT基礎リテラシーの証明。"},toeic730:{id:"toeic730",name:"TOEIC 730点以上",category:"language",tier:"D",difficulty:2,duration:6,cost:1e5,spawnRate:.16,passRate:.2,salaryMultiplier:1.2,minSalary:29e5,abilityBonus:{english:20,business:10,reading:15},requirements:[],effects:{business_english_basics:1.2,overseas_support:1.15,email_english:!0},description:"ビジネス英語の基準点。海外案件サポート可能。"},mos_excel:{id:"mos_excel",name:"MOS Excel Expert",category:"office",tier:"D",difficulty:1,duration:2,cost:5e4,spawnRate:.14,passRate:.8,salaryMultiplier:1.12,minSalary:27e5,abilityBonus:{excel:25,administration:15,analysis:10},requirements:[],effects:{advanced_excel:!0,data_analysis_efficiency:1.2,business_automation:1.15},description:"事務職の必須スキル。高度なExcel操作とVBA。"},google_analytics:{id:"google_analytics",name:"Googleアナリティクス個人認定資格（GAIQ）",category:"marketing",tier:"D",difficulty:1,duration:1,cost:3e4,spawnRate:.11,passRate:.7,salaryMultiplier:1.15,minSalary:28e5,abilityBonus:{web_analytics:20,marketing:15,data:15},requirements:[],effects:{web_analysis:!0,marketing_measurement:1.2,data_driven_decision:1.15},description:"Webマーケの基本。サイト分析とマーケティング施策評価。"},marketing2:{id:"marketing2",name:"マーケティング検定2級",category:"marketing",tier:"D",difficulty:2,duration:3,cost:5e4,spawnRate:.13,passRate:.6,salaryMultiplier:1.18,minSalary:285e4,abilityBonus:{marketing:20,sales:15,planning:20},requirements:[],effects:{marketing_basics:1.2,market_analysis:1.15,sales_strategy_support:1.1},description:"マーケティング部門の基礎。市場分析と営業戦略立案。"}},am={S:"🏆",A:"⭐",B:"🌟",C:"💫",D:"⚡"},rm=.05;function Ea(e){if(Math.random()>rm)return null;const t=[];for(const[o,a]of Object.entries(De)){if(a.tier==="S"&&e.age<28||a.tier==="A"&&e.age<25||a.tier==="B"&&e.age<23)continue;const r=(e.abilities.technical+e.abilities.sales+e.abilities.planning+e.abilities.management)/4;a.tier==="S"&&r<75||a.tier==="A"&&r<65||a.tier==="B"&&r<55||a.tier==="C"&&r<45||a.requirements&&a.requirements.length>0||Math.random()<a.spawnRate&&t.push({id:o,qual:a,weight:a.spawnRate})}if(t.length===0)return null;const n=t.reduce((o,a)=>o+a.weight,0);let i=Math.random()*n;for(const o of t)if(i-=o.weight,i<=0)return o.id;return t[0].id}function Aa(e,t){let n=3e6;const i=(e.abilities.technical+e.abilities.sales+e.abilities.planning+e.abilities.management)/4;if(n+=(i-50)*3e4,t&&De[t]){const o=De[t];n*=o.salaryMultiplier,n=Math.max(n,o.minSalary)}return n+=(e.age-22)*5e4,e.personality==="ambitious"?n*=1.1:e.personality==="cooperative"&&(n*=.95),Math.floor(n)}function mn(e){if(!e||!De[e])return"";const t=De[e],n=am[t.tier]||"📜";return`
        <div class="qualification-badge tier-${t.tier}" title="${t.description}">
            <span class="qual-emoji">${n}</span>
            <span class="qual-name">${t.name}</span>
        </div>
    `}function fn(e){if(!e||!De[e])return"";const t=De[e];let n='<div class="qualification-bonus-details">';n+="<h4>📊 資格ボーナス</h4>",n+='<div class="bonus-grid">';for(const[i,o]of Object.entries(t.abilityBonus))n+=`
            <div class="bonus-item">
                <span class="bonus-label">${i}:</span>
                <span class="bonus-value">+${o}</span>
            </div>
        `;return n+="</div>",n+=`
        <div class="qual-salary-info">
            <div>給与倍率: <strong>×${t.salaryMultiplier}</strong></div>
            <div>最低年収: <strong>¥${t.minSalary.toLocaleString()}</strong></div>
        </div>
    `,n+=`
        <p class="qual-description">${t.description}</p>
    `,n+="</div>",n}let nn=null;function ki(e){if(!e||e.length<2)return 1;const t=e.map(o=>`${o.id}:${o.personalityKey||""}`).join(",");if(nn&&nn.key===t)return nn.value;let n=1;for(let o=0;o<e.length;o++)for(let a=o+1;a<e.length;a++){const r=e[o],c=e[a];if(!r.personalityKey||!c.personalityKey)continue;const d=le[r.personalityKey],u=le[c.personalityKey];!d||!u||(d.compatible&&d.compatible.includes(c.personalityKey)&&(n+=.1),d.incompatible&&d.incompatible.includes(c.personalityKey)&&(n-=.15))}const i=Math.max(.7,Math.min(1.3,n));return nn={key:t,value:i},i}function Ma(e){return e>=90?.2:e>=80?.4:e>=70?.6:1}function ja(){const e=N(),t=["佐藤","鈴木","高橋","田中","伊藤","渡辺","山本","中村","小林","加藤"],n=["太郎","花子","一郎","美咲","健太","優子","翔太","愛","大輔","綾乃"],i=Object.keys(le),o=i[Math.floor(Math.random()*i.length)],a=Object.keys($t),r=2+Math.floor(Math.random()*2),c=[],d=[...a].sort(()=>Math.random()-.5);for(let L=0;L<r&&L<d.length;L++)c.push(d[L]);const u=Object.keys(Ue),v=u[Math.floor(Math.random()*u.length)],f=Object.keys(ue),y=f[Math.floor(Math.random()*f.length)],$=ue[y],T={id:Date.now()+Math.random(),name:t[Math.floor(Math.random()*t.length)]+" "+n[Math.floor(Math.random()*n.length)],age:22+Math.floor(Math.random()*18),personalityKey:o,abilities:{technical:30+Math.floor(Math.random()*50),sales:30+Math.floor(Math.random()*50),planning:30+Math.floor(Math.random()*50),management:30+Math.floor(Math.random()*50)},temperament:$n(o),subTraits:c,hiddenTrait:v,hiddenTraitRevealed:!1,joinedTurn:e.turn,motivation:70,department:y,position:"staff",skillPoints:0,unlockedSkills:[],growthHistory:[{turn:e.turn,event:"入社",description:`${$.emoji} ${$.name}に配属されました`}]};return T.qualification=Ea(T),T.salary=Aa(T,T.qualification),T}function rn(e){const t=N(),n=["佐藤","鈴木","高橋","田中","伊藤","渡辺","山本","中村","小林","加藤"],i=["太郎","花子","一郎","美咲","健太","優子","翔太","愛","大輔","綾乃"],o=ue[e];if(!o)return ja();const a=Object.keys(le),r=a[Math.floor(Math.random()*a.length)],c=Object.keys($t),d=2+Math.floor(Math.random()*2),u=[],v=[...c].sort(()=>Math.random()-.5);for(let D=0;D<d&&D<v.length;D++)u.push(v[D]);const f=Object.keys(Ue),y=f[Math.floor(Math.random()*f.length)],$={};Object.keys(o.abilityWeights).forEach(D=>{const O=o.abilityWeights[D];$[D]=O.min+Math.floor(Math.random()*(O.max-O.min+1))});const L={...$n(r)};o.temperamentWeights&&Object.keys(o.temperamentWeights).forEach(D=>{const O=o.temperamentWeights[D];L[D]=Math.max(0,Math.min(100,L[D]+O))});const A={id:Date.now()+Math.random(),name:n[Math.floor(Math.random()*n.length)]+" "+i[Math.floor(Math.random()*i.length)],age:22+Math.floor(Math.random()*18),personalityKey:r,abilities:$,temperament:L,subTraits:u,hiddenTrait:y,hiddenTraitRevealed:!1,joinedTurn:t.turn,motivation:70,department:e,position:"staff",skillPoints:0,unlockedSkills:[],growthHistory:[{turn:t.turn,event:"入社",description:`${o.emoji} ${o.name}に配属されました`}]};return A.qualification=Ea(A),A.salary=Aa(A,A.qualification),A}function Ci(e){const t=["staff","senior","manager","director"],n=t.indexOf(e.position);if(n===-1||n>=t.length-1)return!1;const i=t[n+1],o=be[i];return(e.abilities.technical+e.abilities.sales+e.abilities.planning+e.abilities.management)/4>=o.requiredAbility}function Si(e,t,n){const i=ze[t]?.skills[n];if(!i||e.unlockedSkills.includes(n)||e.skillPoints<i.cost)return!1;if(i.prerequisites&&i.prerequisites.length>0){for(const o of i.prerequisites)if(!e.unlockedSkills.includes(o))return!1}return!0}function sm(){const e=N();return wn.map(t=>({...t,unlocked:(e.unlockedAchievements||[]).includes(t.id),rarity:si[t.rarity],category:t.category}))}function Ia(){const t=(N().unlockedAchievements||[]).length,n=wn.filter(i=>i&&!i.hidden).length;return{unlocked:t,total:n,percentage:Math.round(t/n*100)}}function za(){const e=N(),t=document.getElementById("achievementDisplay");if(!t)return;const n=Ia(),i=(e.unlockedAchievements||[]).slice(-5).reverse().map(a=>wn.find(r=>r.id===a)).filter(Boolean),o=E`
        <div class="achievement-header">
            <h4 style="margin: 0; font-size: 14px;">🏆 実績</h4>
            <span class="achievement-progress">${n.unlocked}/${n.total}</span>
        </div>
        <div class="achievement-progress-bar">
            <div class="achievement-progress-fill" style="width: ${n.percentage}%"></div>
        </div>
        <div class="achievement-list">
            ${i.length>0?i.map(a=>{const r=si[a.rarity];return E`
                    <div class="achievement-badge" style="background: ${r.bgColor}; border: 2px solid ${r.color};"
                         title="${a.name}: ${a.description}">
                        <span class="achievement-emoji">${a.emoji}</span>
                    </div>
                `}):E`
                <div style="color: #999; font-size: 12px; text-align: center; width: 100%;">
                    まだ実績がありません
                </div>
            `}
        </div>
        <button class="btn-small" @click=${Pa} style="margin-top: 8px; width: 100%;">
            すべての実績を見る
        </button>
    `;ae(o,t)}function Pa(){const e=sm(),t=Ia(),n={money:{name:"💰 資金系",achievements:[]},employees:{name:"👥 従業員系",achievements:[]},products:{name:"📦 製品系",achievements:[]},market:{name:"📊 市場系",achievements:[]},special:{name:"✨ 特殊系",achievements:[]}};e.forEach(o=>{(!o.hidden||o.unlocked)&&n[o.category].achievements.push(o)});let i=`
        <div style="margin-bottom: 16px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">🏆 実績コレクション</div>
            <div style="font-size: 14px; color: #666;">
                解除済み: <strong>${t.unlocked}</strong> / ${t.total}
                (<strong>${t.percentage}%</strong>)
            </div>
            <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; margin-top: 8px;">
                <div style="width: ${t.percentage}%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px;"></div>
            </div>
        </div>
    `;Object.entries(n).forEach(([,o])=>{o.achievements.length!==0&&(i+=`
            <div style="margin-bottom: 16px;">
                <div style="font-weight: bold; margin-bottom: 8px;">${o.name}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    ${o.achievements.map(a=>{const r=a.unlocked?"1":"0.4",c=a.unlocked?"none":"grayscale(100%)";return`
                            <div style="background: ${a.rarity.bgColor}; padding: 12px; border-radius: 12px;
                                        border: 2px solid ${a.unlocked?a.rarity.color:"#ddd"}; opacity: ${r}; filter: ${c};">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 24px;">${a.emoji}</span>
                                    <div>
                                        <div style="font-weight: bold; font-size: 13px;">${a.name}</div>
                                        <div style="font-size: 11px; color: ${a.rarity.color};">${a.rarity.name}</div>
                                    </div>
                                </div>
                                <div style="font-size: 11px; color: #666; margin-top: 6px;">
                                    ${a.unlocked?a.description:a.hidden?"???":a.description}
                                </div>
                            </div>
                        `}).join("")}
                </div>
            </div>
        `)})(window).showModal("🏆 実績一覧",i,!0)}function Ra(){const e=N(),n=[...xt().map(r=>({name:r.name,share:r.share??r.initialShare,isPlayer:!1})),{name:"あなた",share:e.marketShare,isPlayer:!0}].sort((r,c)=>c.share-r.share),i=document.getElementById("rankingBar");if(!i)return;const o=["🥇","🥈","🥉","4"],a=E`
        ${n.slice(0,4).map((r,c)=>E`
            <div class="rank-item ${r.isPlayer?"player":""}">
                <span class="rank-medal">${o[c]}</span>
                ${r.name}<br>(${r.share.toFixed(1)}%)
            </div>
        `)}
    `;ae(a,i)}const cm=["overview","employees","departments","products","market","finance","certifications"];function gn(e){const t=e==="ceo";cm.forEach(i=>{const o=document.querySelector(`.tab[data-panel="${i}"]`);o&&(o.style.display=t?"none":"")});const n=document.querySelector('.tab[data-panel="desk"]');n&&(n.style.display=t?"":"none")}function Da(e,t){const n=N();let i=t||"overview",o=e;n.gameMode==="ceo"&&i!=="desk"?(i="desk",o=document.querySelector('.tab[data-panel="desk"]')):o||(o=document.querySelector(`.tab[data-panel="${i}"]`)),document.querySelectorAll(".tab").forEach(r=>r.classList.remove("active")),o&&o.classList.add("active"),document.querySelectorAll(".panel").forEach(r=>r.classList.remove("active"));const a=document.getElementById(i);a&&a.classList.add("active"),yt(i),he()}function lm(){const e=N(),t=document.getElementById("officeDisplay");if(!t)return;const n=Re[e.officeLevel],i=Re[e.officeLevel+1],o={1:{primary:"#6c757d",gradient:"linear-gradient(135deg, #6c757d 0%, #495057 100%)"},2:{primary:"#28a745",gradient:"linear-gradient(135deg, #28a745 0%, #218838 100%)"},3:{primary:"#007bff",gradient:"linear-gradient(135deg, #007bff 0%, #0056b3 100%)"},4:{primary:"#6f42c1",gradient:"linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)"},5:{primary:"#fd7e14",gradient:"linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)"}},a=o[e.officeLevel]||o[1];let r=0,c=0,d=0,u=0;i?(c=Math.min(100,e.employees.length/i.unlockConditions.employees*100),d=Math.min(100,e.money/i.unlockConditions.money*100),u=Math.min(100,e.marketShare/i.unlockConditions.marketShare*100),r=(c+d+u)/3):r=100;const v=E`
        <div class="office-display enhanced">
            <div class="office-header" style="background: ${a.gradient};">
                <div class="office-level-badge-new">Lv.${e.officeLevel}</div>
                <div class="office-icon-large">${n.emoji}</div>
                <div class="office-name-large">${n.name}</div>
            </div>

            <div class="office-evolution-line">
                ${Object.keys(Re).map((f,y)=>{const $=parseInt(f),T=$<=e.officeLevel,L=$===e.officeLevel;return E`
                        ${y>0?E`<div class="evolution-connector"></div>`:F}
                        <div class="office-evolution-step ${T?"active":""} ${L?"current":""}">
                            <div class="evolution-emoji">${Re[$].emoji}</div>
                            ${L?E`<div class="current-indicator">▲</div>`:F}
                        </div>
                    `})}
            </div>

            <div class="office-body">
                <div class="office-description-box">
                    <span class="description-icon">📍</span>
                    ${n.description}
                </div>

                ${i?E`
                    <div class="next-level-section">
                        <div class="next-level-header">
                            <span>${i.emoji}</span>
                            <span>次のレベル: <strong>${i.name}</strong></span>
                        </div>

                        <div class="condition-progress-list">
                            <div class="condition-item">
                                <div class="condition-label">
                                    <span>👥 従業員</span>
                                    <span class="${c>=100?"complete":""}">${e.employees.length} / ${i.unlockConditions.employees}</span>
                                </div>
                                <div class="condition-bar">
                                    <div class="condition-bar-fill" style="width: ${c}%; background: #28a745;"></div>
                                </div>
                            </div>
                            <div class="condition-item">
                                <div class="condition-label">
                                    <span>💰 資金</span>
                                    <span class="${d>=100?"complete":""}">${Math.floor(e.money/1e4)}万 / ${Math.floor(i.unlockConditions.money/1e4)}万</span>
                                </div>
                                <div class="condition-bar">
                                    <div class="condition-bar-fill" style="width: ${d}%; background: #ffc107;"></div>
                                </div>
                            </div>
                            <div class="condition-item">
                                <div class="condition-label">
                                    <span>📊 シェア</span>
                                    <span class="${u>=100?"complete":""}">${e.marketShare.toFixed(1)}% / ${i.unlockConditions.marketShare}%</span>
                                </div>
                                <div class="condition-bar">
                                    <div class="condition-bar-fill" style="width: ${u}%; background: #007bff;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="total-progress">
                            <div class="total-progress-label">総合進捗: <strong>${Math.floor(r)}%</strong></div>
                            <div class="total-progress-bar">
                                <div class="total-progress-fill" style="width: ${r}%;"></div>
                            </div>
                        </div>
                    </div>
                `:E`
                    <div class="max-level-banner">
                        <div class="max-level-icon">🏆</div>
                        <div class="max-level-text">最高レベル達成！</div>
                        <div class="max-level-sub">業界を制覇しました</div>
                    </div>
                `}

                <div class="office-capacity">
                    <div class="capacity-header">オフィス収容人数</div>
                    <div class="capacity-visual">
                        ${Array(Math.ceil(n.maxEmployees/10)).fill(0).map((f,y)=>{const $=Math.min(10,e.employees.length-y*10),T=Math.min(10,n.maxEmployees-y*10);return E`<div class="capacity-row">
                                ${Array(T).fill(0).map((L,A)=>E`<span class="capacity-dot ${A<$?"filled":""}">●</span>`)}
                            </div>`})}
                    </div>
                    <div class="capacity-text">${e.employees.length} / ${n.maxEmployees} 名</div>
                </div>
            </div>
        </div>
    `;ae(v,t)}function he(){const e=N();let t=vt();if(e.gameMode==="ceo"&&t!=="desk"&&(yt("desk"),t="desk"),t==="overview")lm(),za();else if(t==="employees")dm();else if(t==="departments")gm();else if(t==="products")um();else if(t==="market")pm(),typeof window.updateMarketChart=="function"&&window.updateMarketChart();else if(t==="finance")fm();else if(t==="desk"){const n=document.getElementById("desk");n&&ae(E`${Sa(nm(N()))}`,n)}}function ve(){const e=N(),t=document.getElementById("money");t&&(t.textContent=`${Math.floor(e.money/1e4)}万`);const n=document.getElementById("employeeCount");n&&(n.textContent=String(e.employees.length));const i=document.getElementById("revenue");i&&(i.textContent=`${Math.floor(e.monthlyRevenue/1e4)}万`);const o=document.getElementById("gameDate");o&&(o.textContent=`${e.year}年${e.month}月 第${e.week}週`);const a=document.getElementById("marketShare");a&&(a.textContent=`${e.marketShare.toFixed(1)}%`);const r=Math.max(0,Math.min(5,Math.floor(e.brandPower))),c=document.getElementById("brand");c&&(c.textContent=r>0?"⭐".repeat(r):"―");const d=Math.min(100,e.money/2e7*100),u=document.getElementById("moneyProgress");u&&(u.style.width=d+"%");const v=Math.min(100,e.monthlyRevenue/1e7*100),f=document.getElementById("revenueProgress");f&&(f.style.width=v+"%"),Oa(),typeof window.updateCharts=="function"&&window.updateCharts()}function Oa(){const t=N().isBankrupt;document.querySelectorAll('[data-requires-active="true"]').forEach(i=>{i.disabled=t});const n=document.getElementById("restartButton");n&&(n.style.display=t?"block":"none")}function dm(){const e=N(),t=document.getElementById("employeeList");if(!t)return;if(e.employees.length===0){ae(E`<div class="empty">従業員がいません</div>`,t);return}const n=ki(e.employees),i=E`
        ${e.employees.length>1?E`
            <div class="info-box" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">🤝 チーム相性</span>
                    <span style="font-weight: bold; color: ${n>=1?"#4caf50":"#ff9800"};">
                        ${(n*100).toFixed(0)}%
                    </span>
                </div>
            </div>
        `:F}
        ${e.employees.map((o,a)=>{const r=le[o.personalityKey]||le.logical;return E`
                <div class="employee" @click=${()=>window.showEmployeeDetail(e.employees[a])}>
                    <div class="employee-header">
                        <div class="employee-name">
                            <span class="icon-badge">👤</span>
                            ${o.name}
                        </div>
                        <span class="personality">${r.emoji} ${r.name}</span>
                    </div>
                    <div style="margin: 8px 0; display: flex; gap: 6px; flex-wrap: wrap;">
                        <span class="department-badge">${ue[o.department]?.emoji||"💻"} ${ue[o.department]?.name||"開発部"}</span>
                        <span class="position-badge">${be[o.position]?.emoji||"👤"} ${be[o.position]?.name||"スタッフ"}</span>
                    </div>
                    ${o.subTraits&&o.subTraits.length>0?E`
                        <div style="margin: 12px 0; display: flex; flex-wrap: wrap; gap: 6px;">
                            ${o.subTraits.map(c=>{const d=$t[c];return d?E`<span style="background: ${d.negative?"rgba(244, 67, 54, 0.15)":"rgba(76, 175, 80, 0.15)"};
                                               color: ${d.negative?"#f44336":"#4caf50"};
                                               padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                    ${d.emoji} ${d.name}
                                </span>`:F})}
                        </div>
                    `:F}
                    ${o.hiddenTraitRevealed?E`
                        <div style="margin: 8px 0;">
                            <span style="background: linear-gradient(135deg, #ffd700, #ffed4e);
                                   padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #333;">
                                ✨ ${Ue[o.hiddenTrait].emoji} ${Ue[o.hiddenTrait].name}
                            </span>
                        </div>
                    `:F}
                    <div class="abilities">
                        <div class="ability">
                            <span class="ability-name">⚙️ 技術: ${o.abilities.technical}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${o.abilities.technical}%"></div>
                            </div>
                        </div>
                        <div class="ability">
                            <span class="ability-name">💼 営業: ${o.abilities.sales}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${o.abilities.sales}%"></div>
                            </div>
                        </div>
                        <div class="ability">
                            <span class="ability-name">📋 企画: ${o.abilities.planning}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${o.abilities.planning}%"></div>
                            </div>
                        </div>
                        <div class="ability">
                            <span class="ability-name">👔 管理: ${o.abilities.management}</span>
                            <div class="ability-bar">
                                <div class="ability-bar-fill" style="width: ${o.abilities.management}%"></div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 8px; color: #667eea; font-weight: 600;">💰 月給: ${Math.floor(o.salary/1e4)}万円</div>
                </div>
            `})}
    `;ae(i,t)}function um(){const e=N(),t=document.getElementById("productList");if(t){if(e.products.length===0){ae(E`<div class="empty">製品がありません<br>💡 新製品を開発しましょう!</div>`,t);return}ae(E`${e.products.map(n=>E`
        <div class="product">
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">📦 ${n.name}</div>
            <div class="product-quality">⭐ 品質: ${n.quality}%</div>
            <div style="margin-top: 8px; font-weight: 600;">💵 累計売上: ${Math.floor(n.sales/1e4)}万円</div>
        </div>
    `)}`,t)}}function pm(){const e=N(),t=xt(),n=document.getElementById("marketInfo");if(!n)return;const i=_n[e.difficulty||"normal"],o=E`
        <div style="background: linear-gradient(135deg, #f8f9ff, #e8ecff); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">${i.emoji}</span>
                <span style="font-weight: bold; color: #667eea;">難易度: ${i.name}</span>
            </div>
            <div style="font-size: 12px; color: #666;">${i.description}</div>
        </div>

        <h4 style="margin-top: 20px; margin-bottom: 12px; color: #667eea;">🏆 競合企業</h4>
        ${t.map(a=>{const r=a.share??a.initialShare,c=ri[a.strategy],d=a.alertLevel>70?"#f44336":a.alertLevel>40?"#ff9800":"#4caf50";return E`
            <div class="competitor" style="border-left: 4px solid ${a.color}; padding: 12px; margin-bottom: 16px; background: #f9f9f9; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 15px;">🏢 ${a.name}</strong>
                    <span style="font-size: 12px; background: ${d}; color: white; padding: 2px 8px; border-radius: 10px;">
                        警戒: ${Math.floor(a.alertLevel)}%
                    </span>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 20px;">${a.ceo.emoji}</span>
                    <div>
                        <div style="font-size: 13px; font-weight: bold;">${a.ceo.name}</div>
                        <div style="font-size: 11px; color: #666; font-style: italic;">"${a.ceo.quote}"</div>
                    </div>
                </div>
                <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                    <div>📊 シェア: <strong>${r.toFixed(1)}%</strong></div>
                    <div>💪 パワー: <strong>${a.power}</strong></div>
                    <div>${c.emoji} ${c.name}</div>
                    <div>🎯 ${a.speciality}</div>
                </div>
                ${a.lastAction?E`
                    <div style="margin-top: 8px; font-size: 12px; color: #e74c3c; background: #fff5f5; padding: 6px 10px; border-radius: 6px;">
                        ⚠️ 最近の動き: ${Zo[a.lastAction]?.name||a.lastAction}
                    </div>
                `:F}
            </div>
        `})}

        ${e.competitorAttacks&&e.competitorAttacks.length>0?E`
            <h4 style="margin-top: 20px; margin-bottom: 12px; color: #e74c3c;">⚔️ 最近の競合動向</h4>
            <div style="background: #fff5f5; padding: 12px; border-radius: 8px; font-size: 13px;">
                ${e.competitorAttacks.map(a=>E`<div style="margin-bottom: 4px;">• ${a}</div>`)}
            </div>
        `:F}
    `;ae(o,n)}const mm=.02;function fm(){const e=N(),t=document.getElementById("financeInfo");if(!t)return;const n=e.employees.reduce((a,r)=>a+r.salary,0),i=e.debt>0?Math.floor(e.debt*mm):0,o=E`
        <div class="info-box">
            <div>
                <span>📊 売上高</span>
                <strong>${Math.floor(e.monthlyRevenue/1e4)}万円</strong>
            </div>
            <div>
                <span>👥 人件費</span>
                <strong>${Math.floor(n/1e4)}万円</strong>
            </div>
            <div style="border-top: 2px solid #667eea; padding-top: 8px; margin-top: 8px;">
                <span>💰 純利益</span>
                <strong style="color: ${e.monthlyRevenue-n-i>=0?"#4caf50":"#f44336"}">
                    ${Math.floor((e.monthlyRevenue-n-i)/1e4)}万円
                </strong>
            </div>
            ${e.debt?E`<div style="margin-top: 8px;">
                <span>🏦 借金残高</span>
                <strong style="color: #ff9800;">${Math.floor(e.debt/1e4)}万円</strong>
            </div>`:F}
            ${i?E`<div>
                <span>📈 次月利息見込</span>
                <strong>${Math.floor(i/1e4)}万円</strong>
            </div>`:F}
        </div>
    `;ae(o,t)}function gm(){const e=N(),t=document.getElementById("departmentsGrid");if(!t)return;if(e.employees.length===0){ae(E`<div class="empty">従業員がまだいません</div>`,t);return}const n={};Object.keys(ue).forEach(o=>{n[o]={employees:[],totalAbility:0,manager:null}}),e.employees.forEach(o=>{const a=o.department||"development";if(n[a]){n[a].employees.push(o);const r=(o.abilities.technical+o.abilities.sales+o.abilities.planning+o.abilities.management)/4;n[a].totalAbility+=r;const c=be[o.position],d=n[a].manager;(!d||c&&c.requiredAbility>(be[d.position]?.requiredAbility||0))&&(n[a].manager=o)}});const i=E`
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            ${Object.keys(ue).map(o=>{const a=ue[o],r=n[o],c=r.employees.length,d=c>0?Math.round(r.totalAbility/c):0,u=Math.min(100,d*1.2),v=u>=80?"#4caf50":u>=50?"#ff9800":"#f44336";return E`
                    <div class="department-card">
                        <div class="department-card-header">
                            <div style="font-size: 32px; margin-bottom: 8px;">${a.emoji}</div>
                            <div style="font-size: 18px; font-weight: 700; color: #333;">${a.name}</div>
                            <div style="font-size: 12px; color: #999; margin-top: 4px;">${a.description}</div>
                        </div>

                        <div class="department-stats">
                            <div class="stat-item">
                                <div class="department-stat-label">👥 人数</div>
                                <div class="department-stat-value">${c}名</div>
                            </div>
                            <div class="stat-item">
                                <div class="department-stat-label">💪 平均能力</div>
                                <div class="department-stat-value">${d}</div>
                            </div>
                        </div>

                        <div class="department-manager">
                            <div style="font-size: 12px; font-weight: 600; color: #667eea; margin-bottom: 6px;">👔 責任者</div>
                            ${r.manager?E`
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 20px;">${le[r.manager.personalityKey]?.emoji||"👤"}</span>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 600;">${r.manager.name}</div>
                                        <div style="font-size: 11px; color: #999;">
                                            ${be[r.manager.position]?.emoji||"👤"} ${be[r.manager.position]?.name||"スタッフ"}
                                        </div>
                                    </div>
                                </div>
                            `:E`<div style="font-size: 12px; color: #999;">未配置</div>`}
                        </div>

                        <div class="department-efficiency">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 12px; font-weight: 600; color: #667eea;">📊 効率性</span>
                                <span style="font-size: 14px; font-weight: 700; color: ${v};">${Math.round(u)}%</span>
                            </div>
                            <div style="background: rgba(0,0,0,0.05); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: ${v}; height: 100%; width: ${u}%;
                                           transition: width 0.3s ease; border-radius: 4px;"></div>
                            </div>
                        </div>

                        ${c>0?E`
                            <div class="department-employees">
                                <div style="font-size: 11px; color: #999; margin-bottom: 6px;">所属メンバー</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${r.employees.slice(0,8).map(f=>E`<span style="font-size: 16px;" title="${f.name}">
                                            ${le[f.personalityKey]?.emoji||"👤"}
                                        </span>`)}
                                    ${c>8?E`<span style="font-size: 11px; color: #999; align-self: center;">+${c-8}</span>`:F}
                                </div>
                            </div>
                        `:F}
                    </div>
                `})}
        </div>
    `;ae(i,t)}const Na="businessEmpire";function Ee(e,...t){const n=window[e];typeof n=="function"&&n(...t)}function hm(){const e=N(),t=e.employees.length,n=e.money,i=e.marketShare;for(let o=5;o>=1;o--){const a=Re[o].unlockConditions;if(t>=a.employees&&n>=a.money&&i>=a.marketShare)return o}return 1}function vm(){const e=N(),t=hm();if(t>e.officeLevel){const n=Re[e.officeLevel],i=Re[t];return e.officeLevel=t,setTimeout(()=>{window.showModal("🎉 オフィスアップグレード！",`<div style="text-align: center; padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">
                        ${n.emoji} → ${i.emoji}
                    </div>
                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #667eea;">
                        ${i.name}
                    </div>
                    <div style="color: #666; margin-bottom: 20px;">
                        ${i.description}
                    </div>
                    <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">📊 新しい上限</div>
                        <div>最大従業員数: <strong>${i.maxEmployees}名</strong></div>
                    </div>
                </div>`)},800),!0}return!1}function Zt(){const e=N();if(va(),e.employees.length>0)return;const t={id:1,name:"山田 太郎",personalityKey:"logical",abilities:{technical:65,sales:45,planning:55,management:50},temperament:$n("logical"),subTraits:["fast_learner","code_reviewer"],hiddenTrait:"late_bloomer",hiddenTraitRevealed:!1,joinedTurn:1,motivation:75,salary:4e5,department:"development",position:"staff",qualification:null,growthHistory:[{turn:1,event:"入社",description:"会社に参加しました"}]};e.employees.push(t)}async function ym(){const e=N();try{const t=await ma.getItem(Na);if(!t)return!1;const n=JSON.parse(t),i=Object.assign(Sn(),n);yi(i),Tn();const o=typeof n.activePanel=="string"?n.activePanel:"overview";return yt(o),delete e.activePanel,!0}catch{return!1}}async function bm(e,t){const n=N(),i=xt();Lu(e);const o=await Du(e);if(o){const a=Object.assign(Sn(),o);yi(a),Tn();const r=typeof o.activePanel=="string"?o.activePanel:"overview";yt(r),delete n.activePanel,n.employees.length===0&&Zt(),n.gameMode==="ceo"?(gn("ceo"),vt()!=="desk"&&yt("desk")):gn("management")}else{if(bi(),t){const a=_n[t];n.difficulty=t,n.money=a.startingMoney}Zu(),i.forEach(a=>{a.share=a.initialShare}),Zt(),setTimeout(()=>{n.tutorialCompleted||window.startTutorial?.()},1e3)}Ee("generateNews"),Ee("updateDisplay"),Ee("updateRanking"),Ee("initCharts"),Ee("showPanel",null,vt())}async function _m(){const e=N();await ym()?(Tn(),e.employees.length===0&&Zt()):(bi(),Zt()),Ee("generateNews"),Ee("updateDisplay"),Ee("updateRanking"),Ee("initCharts"),Ee("showPanel",null,vt())}function wm(){try{ms("game-canvas"),$m()}catch{}}function Ba(e){if(e.jobType)return e.jobType;const t={technical:e.technical||0,sales:e.sales||0,planning:e.planning||0,management:e.management||0},n=Math.max(...Object.values(t));return t.technical===n?"developer":t.sales===n?"sales":t.planning===n?"marketing":"manager"}function $m(){const e=N();Pt.clearAllCharacters(),e.employees.forEach(t=>{const n=Ba(t),i=t.name||`社員${t.id}`;Pt.addCharacter(String(t.id),i,n,()=>{window.showEmployeeDetail?.(t)}),La(t)})}function La(e){const t=N();let n="idle";t.products?.some(o=>o.assignedEmployees?.includes(e.id)||o.assignedEmployees?.some(a=>a.id===e.id))&&(n=(e.stress||0)>70?"stressed":"working"),Pt.setAnimation(String(e.id),n)}function Za(){N().employees.forEach(t=>La(t))}function xm(){const e=N();if(e.isBankrupt)return;if(e.gameMode==="ceo"&&e.isGameOver){window.showModal?.("🏢 ゲームオーバー",e.gameOverReason||"経営が破綻しました。");return}if(e.turn++,Za(),e.week++,e.gameMode==="ceo"&&e.ceo){$p(e);const n=ip(e);if(n.length>0){const d=n.map(u=>`<div style="margin:8px 0;padding:10px;background:rgba(52,152,219,0.08);border-radius:8px;"><strong>🔍 ${u.title}</strong><br>${u.investigationResult}</div>`).join("");window.showModal?.("🔍 調査結果報告",d,!0)}const i=ap(e);i.length>0&&setTimeout(()=>{const d=i.map(u=>`<div style="margin:8px 0;padding:10px;background:rgba(46,204,113,0.1);border-radius:8px;">🌱 ${u.description}</div>`).join("");window.showModal?.("🌱 投資の成果",d,!0)},300);const o=op(e);o.documents.length>0&&e.documentQueue.push(...o.documents);for(const d of e.pendingDirectives){const u=Ju(e,d);e.documentQueue.push(...u)}e.pendingDirectives=[];const a=_a(e);e.documentQueue.push(...a);const r=np(e);r.length>0&&setTimeout(()=>{const d=r.map(u=>`<div style="margin:6px 0;color:#e74c3c;">⚠️ ${u.description}</div>`).join("");window.showModal?.("⚠️ 期限切れ書類",d,!0)},600);let c;o.visitorTypes.length>0&&(c=o.visitorTypes[0]),e.currentVisitor=pp(e,c),hp(e),rp(e),gp(e)}const t=[];if(e.employees.forEach(n=>{if(n.hiddenTraitRevealed)return;n.joinedTurn||(n.joinedTurn=1);const i=e.turn-n.joinedTurn,o=Ue[n.hiddenTrait];o&&i>=o.revealTurn&&(n.hiddenTraitRevealed=!0,t.push({name:n.name,trait:o}),n.hiddenTrait==="latent_leader"?n.abilities.management=Math.min(100,n.abilities.management+30):n.hiddenTrait==="late_bloomer"?Object.keys(n.abilities).forEach(a=>{n.abilities[a]=Math.min(100,Math.floor(n.abilities[a]*1.5))}):n.hiddenTrait==="self_taught"&&Object.keys(n.abilities).forEach(a=>{n.abilities[a]=Math.min(100,n.abilities[a]+15)}),n.growthHistory||(n.growthHistory=[]),n.growthHistory.push({turn:e.turn,event:"隠れ特性判明",description:`${o.emoji} ${o.name}が判明 - ${o.effect}`}))}),e.week>4){e.week=1,e.month++,e.month>12&&(e.month=1,e.year++),e.employees.forEach(v=>{if(v.hiddenTraitRevealed&&v.hiddenTrait==="self_taught"){const f=["technical","sales","planning","management"][Math.floor(Math.random()*4)];v.abilities[f]=Math.min(100,v.abilities[f]+5)}});const n=Cp(),{revenue:i,salaryTotal:o,interest:a,profit:r,isBankrupt:c}=n;if(c){window.updateDisplay?.(),window.renderActivePanel?.(),window.updateRanking?.(),window.showModal?.("💔 ゲームオーバー","資金不足で倒産しました...<br>再スタートしてください。",!0);return}const d=[`📊 売上: ${Math.floor(i/1e4)}万円`,`👥 人件費: ${Math.floor(o/1e4)}万円`];a>0&&d.push(`📈 利息: ${Math.floor(a/1e4)}万円`);const u=r>=0?"#4caf50":"#f44336";d.push(`<div style="margin-top: 8px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
            💰 最終利益: <strong style="color: ${u}">${Math.floor(r/1e4)}万円</strong>
        </div>`),window.showModal?.("📅 月次決算",d.join("<br>"),!0),window.updateCompetitors?.(),window.generateNews?.()}if(t.length>0&&setTimeout(()=>{const n=t.map(i=>`<div style="margin: 12px 0; padding: 12px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px;">
                    <strong>${j(i.name)}</strong>の隠れた才能が開花！<br>
                    <span style="font-size: 18px;">${i.trait.emoji} ${j(i.trait.name)}</span><br>
                    <span style="font-size: 13px; color: #666;">${j(i.trait.effect)}</span>
                </div>`).join("");window.showModal?.("✨ 隠れた特性が判明！",n,!0),window.renderActivePanel?.()},500),vm(),window.checkAchievements?.(),window.advanceTutorialByAction?.("end_turn"),e.gameMode==="ceo"&&e.ceo){vp(e),xp(e)&&yp(e)&&setTimeout(()=>{window.showModal?.("📊 四半期レビュー",Tp(e),!0),setTimeout(()=>{window.showModal?.("🎯 経営方針",Ep(e),!0)},1e3)},800);const n=wp(e);n&&(e.isGameOver=!0,e.gameOverReason=n,setTimeout(()=>{const i=e.ceo;window.showModal?.("🏢 ゲームオーバー",`<div style="text-align:center;padding:20px;"><div style="font-size:48px;margin-bottom:16px;">😔</div><p style="font-size:16px;">${j(n)}</p><p style="margin-top:16px;color:#888;">決裁回数: ${i.decisionsCorrect+i.decisionsWrong}回 | 正答率: ${i.decisionsCorrect+i.decisionsWrong>0?Math.floor(i.decisionsCorrect/(i.decisionsCorrect+i.decisionsWrong)*100):0}%</p></div>`,!0)},1200)),e.currentVisitor&&setTimeout(()=>{window.showModal?.("🚪 来客",Mp(e.currentVisitor),!0)},400)}window.updateDisplay?.(),window.renderActivePanel?.(),window.updateRanking?.()}async function km(){const e=N();if(!e.isBankrupt)try{const t=Object.assign({},e,{activePanel:vt()});delete t._pendingCausalEffects;const n={slotId:Un(),companyName:e.companyName||"株式会社スタートアップ",playTime:e.turn*60,lastSaveDate:new Date().toISOString(),gameDate:{year:e.year||2025,month:e.month||1,week:e.week||1},money:e.money,employeeCount:e.employees.length,marketShare:parseFloat((e.marketShare||.1).toFixed(2)),brandLevel:Math.floor((e.brandPower||1)/20)};await Ou(Un(),t,n),window.showModal?.("💾 保存完了",`スロット ${Un()} に保存しました`)}catch{window.showModal?.("保存失敗","保存に失敗しました")}}async function Cm(){window.closeModal?.(),bi(),Zt(),gn("management"),window.updateDisplay?.(),window.renderEmployees?.(),window.renderProducts?.(),window.renderMarket?.(),window.renderFinance?.(),window.updateRanking?.(),window.initCharts?.(),window.showPanel?.(null,"overview"),window.generateNews?.(),await ma.removeItem(Na),window.showModal?.("🔄 再スタート","新しいゲームを開始しました")}function Sm(e){const t=N(),n=e.condition,i=n.value,o=n.comparison||"gte",a=r=>{switch(o){case"gte":return r>=i;case"lte":return r<=i;case"eq":return r===i;default:return r>=i}};switch(n.type){case"money":return a(t.money);case"employees":return a(t.employees.length);case"products":return a(t.products.length);case"marketShare":return a(t.marketShare);case"brandPower":return a(t.brandPower);case"turns":return a(t.turn);case"officeLevel":return a(t.officeLevel);case"monthly_profit":const r=t.employees.reduce((f,y)=>f+y.salary,0),c=t.monthlyRevenue-r;return a(c);case"debt_free_rich":return t.debt===0&&a(t.money);case"avg_ability":if(t.employees.length===0)return!1;const d=t.employees.reduce((f,y)=>{const $=y.abilities,T=($.technical+$.sales+$.planning+$.management)/4;return f+T},0)/t.employees.length;return a(d);case"max_quality":const u=Math.max(0,...t.products.map(f=>f.quality||0));return a(u);case"product_sales":const v=Math.max(0,...t.products.map(f=>f.sales||0));return a(v);case"comeback":return t.money<=1e6&&(t.wasLowMoney=!0),t.wasLowMoney&&a(t.money);case"speed_share":return t.turn<=6&&a(t.marketShare);default:return!1}}function Tm(){const e=N();e.unlockedAchievements||(e.unlockedAchievements=[]);const t=[];return wn.forEach(n=>{e.unlockedAchievements.includes(n.id)||Sm(n)&&(e.unlockedAchievements.push(n.id),t.push(n),`${n.name}`,n.id,void 0)}),t}function Em(e){const t=N(),n=xt(),i=fs.filter(d=>!(d.conditions&&(d.conditions.minPlayerShare&&t.marketShare<d.conditions.minPlayerShare||d.conditions.maxPlayerShare&&t.marketShare>d.conditions.maxPlayerShare||d.conditions.minTurn&&t.turn<d.conditions.minTurn)||e&&d.category!==e||!e&&d.category===t.lastNewsCategory&&Math.random()>.3));if(i.length===0){const d=Xi[Math.floor(Math.random()*Xi.length)],u=n[Math.floor(Math.random()*n.length)].name,v=Math.floor(Math.random()*30)+10;return{emoji:"📰",text:d.replace("${company}",u).replace("${percent}",String(v))}}const o=i[Math.floor(Math.random()*i.length)];t.lastNewsCategory=o.category;const a=n[Math.floor(Math.random()*n.length)].name,r=Math.floor(Math.random()*30)+10,c=o.template.replace("${company}",a).replace("${percent}",String(r));return{emoji:o.emoji,text:c}}function Am(){const e=N(),t=xt(),n=[],i=_n[e.difficulty||"normal"],o=dt.difficultyMultipliers[e.difficulty||"normal"],a=i.competitorAggressiveness*o.competitorStrength;return t.forEach(r=>{const c=ri[r.strategy];if(e.marketShare>5&&(r.alertLevel=Math.min(100,r.alertLevel+e.marketShare*.5)),e.marketShare>15&&(r.alertLevel=Math.min(100,r.alertLevel+5)),r.actionCooldown>0&&r.actionCooldown--,r.alertLevel>50&&r.actionCooldown===0&&Math.random()<.3*a){const v=Mm(r);v&&n.push(v)}`${r.name}`,r.alertLevel,r.actionCooldown,r.share??r.initialShare;const d=(Math.random()*2-.5)*c.shareGrowthRate*a,u=r.share??r.initialShare;r.share=Math.max(5,Math.min(60,u+d)),r.share>40&&(e.marketShare=Math.max(.1,e.marketShare-.2*a),e.brandPower>1&&e.brandPower--),r.strategy==="aggressive"&&e.marketShare>5&&(r.power+=3*a)}),n}function Mm(e){const t=N(),n=ri[e.strategy],i=_n[t.difficulty||"normal"],o=Math.random();let a;o<n.poachingChance?a="poaching":o<n.poachingChance+n.priceWarChance?a="priceWar":o<n.poachingChance+n.priceWarChance+n.marketingChance?a="marketing":a="partnership";const r=Zo[a];e.lastAction=a,e.actionCooldown=3;let c=null;switch(a){case"poaching":if(t.employees.length>0&&Math.random()<i.poachingRisk){const u=t.employees[Math.floor(Math.random()*t.employees.length)];u.motivation&&(u.motivation=Math.max(30,u.motivation-15)),c={competitor:e,actionType:a,actionName:r.name,actionEmoji:r.emoji,actionDescription:r.description,targetEmployeeName:u.name}}break;case"priceWar":t.marketShare=Math.max(.1,t.marketShare-.5),c={competitor:e,actionType:a,actionName:r.name,actionEmoji:r.emoji,actionDescription:r.description};break;case"marketing":t.brandPower>1&&(t.brandPower=Math.max(1,t.brandPower-2)),c={competitor:e,actionType:a,actionName:r.name,actionEmoji:r.emoji,actionDescription:r.description};break;case"partnership":const d=e.share??e.initialShare;e.share=Math.min(60,d+3),c={competitor:e,actionType:a,actionName:r.name,actionEmoji:r.emoji,actionDescription:r.description};break}return c&&(t.competitorAttacks||(t.competitorAttacks=[]),t.competitorAttacks.push(`${e.name}: ${r.name}`),t.competitorAttacks.length>5&&t.competitorAttacks.shift()),c}function jm(){const e=N();e.tutorialStep=0,e.tutorialCompleted=!1,Ti()}function Ti(){const e=N();if(e.tutorialCompleted||e.tutorialStep>=Ye.length){qa();return}const t=Ye[e.tutorialStep],n=e.tutorialStep===Ye.length-1;let i=document.getElementById("tutorialOverlay");i||(i=document.createElement("div"),i.id="tutorialOverlay",i.className="tutorial-overlay",document.body.appendChild(i));const o=n?"完了！":t.action?"この操作を実行して進む":"次へ",a=n?"":'<button class="tutorial-skip-btn" onclick="skipTutorial()">スキップ</button>';i.innerHTML=`
        <div class="tutorial-content">
            <div class="tutorial-step-indicator">
                ${Ye.map((r,c)=>`
                    <div class="tutorial-dot ${c===e.tutorialStep?"active":""} ${c<e.tutorialStep?"completed":""}"></div>
                `).join("")}
            </div>
            <div class="tutorial-emoji">${j(t.emoji)}</div>
            <div class="tutorial-title">${j(t.title)}</div>
            <div class="tutorial-description">${j(t.description)}</div>
            ${t.reward?`
                <div class="tutorial-reward">
                    🎁 報酬: ${t.reward.type==="money"?`${(t.reward.value/1e4).toFixed(0)}万円`:`ブランド力+${t.reward.value}`}
                </div>
            `:""}
            <div class="tutorial-buttons">
                ${t.action?`
                    <div class="tutorial-hint">👆 上記の操作を実行してください</div>
                `:`<button class="tutorial-next-btn" onclick="advanceTutorial()">${o}</button>`}
                ${a}
            </div>
        </div>
    `,i.style.display="flex",t.targetElement?zm(t.targetElement):Mn()}function Fa(){const e=N(),t=Ye[e.tutorialStep];t.reward&&(t.reward.type==="money"?e.money+=t.reward.value:t.reward.type==="brandPower"&&(e.brandPower+=t.reward.value)),e.tutorialStep++,e.tutorialStep>=Ye.length?qa():Ti()}function Ei(e){const t=N();if(t.tutorialCompleted)return;const n=Ye[t.tutorialStep];n&&n.action===e&&Fa()}function qa(){const e=N();e.tutorialCompleted=!0,Mn(),Ua()}function Im(){const e=N();e.tutorialCompleted=!0,Mn(),Ua()}function Ua(){const e=document.getElementById("tutorialOverlay");e&&e.remove()}function zm(e){Mn();const t=document.querySelector(e);t&&t.classList.add("tutorial-highlight")}function Mn(){document.querySelectorAll(".tutorial-highlight").forEach(e=>{e.classList.remove("tutorial-highlight")})}function Pm(){const e=document.getElementById("tutorialOverlay");e&&(e.style.display==="none"?Ti():e.style.display="none")}let No=!1;function Ha(){No||(bn.register(Jr,Xr,es,ts,ns,is,os,as,rs,ss,cs,ls,ds),No=!0)}let Qe=null;function _e(){return N().isBankrupt?(B("操作不可","倒産状態のため操作できません。再スタートしてください。"),!1):!0}let ni=!1;function B(e,t,n=!1){const i=document.getElementById("tutorialOverlay");i&&i.style.display!=="none"&&(i.style.display="none",ni=!0),document.getElementById("modalTitle").textContent=e,document.getElementById("modalBody").innerHTML=n?t:j(t).replace(/\n/g,"<br>"),document.getElementById("modal").classList.add("active")}document.addEventListener("keydown",e=>{e.key==="Escape"&&Ce()});function Ce(){const e=document.getElementById("modal");if(e&&(e.classList.remove("active","employee-detail-modal"),Qe&&(Qe.destroy(),Qe=null),ni)){const t=document.getElementById("tutorialOverlay");t&&(t.style.display="flex"),ni=!1}}function Rm(){window.hireCandidates&&window.hireCandidates.length>0?Lm():Ce()}function Dm(e){const t=N(),n=si[e.rarity],i=e.reward?`<div style="margin-top: 12px; font-size: 13px; color: #28a745;">🎁 報酬: ${e.reward.type==="money"?`${(e.reward.value/1e4).toFixed(0)}万円`:e.reward.type==="brandPower"?`ブランド力+${e.reward.value}`:`モチベーション+${e.reward.value}`}</div>`:"";if(setTimeout(()=>{B("🏆 実績解除！",`<div style="text-align: center; padding: 20px; background: ${n.bgColor}; border-radius: 16px;">
                <div style="font-size: 64px; margin-bottom: 16px;">${e.emoji}</div>
                <div style="font-size: 18px; font-weight: bold; color: ${n.color}; margin-bottom: 8px;">
                    ${e.name}
                </div>
                <div style="font-size: 12px; color: ${n.color}; text-transform: uppercase; margin-bottom: 12px;">
                    ${n.name}
                </div>
                <div style="color: #666; font-size: 14px;">
                    ${e.description}
                </div>
                ${i}
            </div>`,!0)},600),e.reward)switch(e.reward.type){case"money":t.money+=e.reward.value;break;case"brandPower":t.brandPower+=e.reward.value;break;case"motivation":t.employees.forEach(o=>{o.motivation=Math.min(100,(o.motivation||80)+e.reward.value)});break}}function Om(){if(!_e())return;const e=N(),t=Re[e.officeLevel];if(e.employees.length>=t.maxEmployees){const n=Re[e.officeLevel+1],i=n?`<div style="margin-top: 12px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 6px;">📈 次のレベル条件</div>
                <div style="font-size: 13px;">
                    ${n.emoji} ${n.name}<br>
                    必要: 従業員${n.unlockConditions.employees}名、資金${Math.floor(n.unlockConditions.money/1e4)}万円、シェア${n.unlockConditions.marketShare}%
                </div>
            </div>`:"";B("🏢 採用上限に達しました",`現在のオフィス（${t.emoji} ${t.name}）では、これ以上従業員を採用できません。<br>
            <br>最大従業員数: <strong>${t.maxEmployees}名</strong>${i}`,!0);return}Wa()}function Wa(){const e=N(),t={};Object.keys(ue).forEach(o=>{t[o]=e.employees.filter(a=>a.department===o).length});const i=`
        <div style="margin-bottom: 20px; padding: 14px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
            <div style="font-size: 13px; color: #666;">
                📊 採用する部署を選択してください。部署に適した応募者が集まります。
            </div>
        </div>
        ${Object.keys(ue).map(o=>{const a=ue[o],r=t[o]||0;return`
            <div class="department-card" onclick="showHiringForDepartment('${o}')" style="
                padding: 20px;
                margin: 10px 0;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
                border: 2px solid rgba(102, 126, 234, 0.2);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.borderColor='rgba(102, 126, 234, 0.5)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.borderColor='rgba(102, 126, 234, 0.2)'; this.style.transform=''; this.style.boxShadow=''">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 24px;">${a.emoji}</div>
                    <div style="font-size: 13px; color: #667eea; font-weight: 600;">現在: ${r}名</div>
                </div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">${a.name}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${a.description}</div>
                <div style="font-size: 11px; color: #999;">
                    主要スキル: ${a.primaryAbility==="technical"?"技術力":a.primaryAbility==="sales"?"営業力":a.primaryAbility==="planning"?"企画力":"管理力"}
                </div>
            </div>
        `}).join("")}
        <div style="margin-top: 20px; font-size: 11px; color: #999; text-align: center;">
            💰 採用募集費: 10万円（部署選択後に支払い）
        </div>
    `;B("🏢 部署別採用活動",i,!0)}function Nm(e){Ce();const t=N(),n=1e5;if(t.money<n){B("採用失敗",`資金不足です（採用募集費: ${n/1e4}万円必要）`);return}t.money-=n,window.updateDisplay?.();const i=[rn(e),rn(e),rn(e)];window.hireCandidates=i;const o=Va(i),a=`
        <div style="padding: 16px;">
            <div style="margin-bottom: 16px; text-align: center; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                <div style="font-size: 14px; color: #333; font-weight: 600;">💼 3名の候補者から選んでください</div>
                <div style="font-size: 12px; color: #666; margin-top: 6px;">
                    📋 採用募集費: ${n/1e4}万円 <span style="color: #4caf50;">✓ 支払済</span>
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">
                    ※ 採用時に追加で給与3ヶ月分が必要です
                </div>
            </div>
            <div class="candidates-grid">
                ${o}
            </div>
        </div>
    `;B("📋 採用活動",a,!0)}function Bm(e){const t=window.hireCandidates[e];if(!t){B("エラー","候補者データが見つかりません");return}window.hireEmployee(t)}function Lm(){const e=window.hireCandidates;if(!e||e.length===0){Ce();return}const t=1e5,n=Va(e),i=`
        <div style="padding: 16px;">
            <div style="margin-bottom: 16px; text-align: center; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                <div style="font-size: 14px; color: #333; font-weight: 600;">💼 3名の候補者から選んでください</div>
                <div style="font-size: 12px; color: #666; margin-top: 6px;">
                    📋 採用募集費: ${t/1e4}万円 <span style="color: #4caf50;">✓ 支払済</span>
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">
                    ※ 採用時に追加で給与3ヶ月分が必要です
                </div>
            </div>
            <div class="candidates-grid">
                ${n}
            </div>
        </div>
    `;B("📋 採用活動",i,!0)}function Va(e){return e.map((t,n)=>{const i=le[t.personalityKey],o=Math.round((t.abilities.technical+t.abilities.sales+t.abilities.planning+t.abilities.management)/4),a=typeof mn=="function"&&t.qualification?mn(t.qualification):"",r=typeof fn=="function"&&t.qualification?fn(t.qualification):"";return`
            <div class="candidate-card-hiring ${t.qualification?"has-qualification":""}" data-index="${n}">
                <div class="candidate-header">
                    <div style="font-size: 28px; margin-bottom: 6px;">${i.emoji}</div>
                    <div class="candidate-name">${j(t.name)} (${t.age}歳)</div>
                    <div class="candidate-personality"
                         onclick="showPersonalityDetail('${t.personalityKey}')"
                         style="cursor: pointer; text-decoration: underline; text-decoration-style: dotted;"
                         title="クリックで詳細を表示">
                        ${i.name}
                    </div>
                    ${a}
                </div>

                <div class="candidate-abilities">
                    <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">💪 能力値 (平均: ${o})</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px;">
                        <div>⚙️ 技術: <strong>${t.abilities.technical}</strong></div>
                        <div>💼 営業: <strong>${t.abilities.sales}</strong></div>
                        <div>📋 企画: <strong>${t.abilities.planning}</strong></div>
                        <div>👔 管理: <strong>${t.abilities.management}</strong></div>
                    </div>
                </div>

                <div class="candidate-traits">
                    <div style="font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                        🌟 特性
                        <span style="font-size: 10px; color: #999; font-weight: normal;">（タップで詳細）</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${t.subTraits.map(c=>{const d=$t[c];return`<span class="trait-badge-small ${d.negative?"negative":"positive"}"
                                          onclick="showTraitDetail('${c}')"
                                          style="cursor: pointer; transition: transform 0.2s;"
                                          onmouseover="this.style.transform='scale(1.1)'"
                                          onmouseout="this.style.transform='scale(1)'"
                                          title="クリックで詳細: ${d.name}">${d.emoji}</span>`}).join("")}
                    </div>
                    <div style="font-size: 10px; color: #999; margin-top: 3px;">※ 隠れ特性あり</div>
                </div>

                ${r}

                <div class="candidate-salary" style="margin: 8px 0;">
                    💰 ${Math.floor(t.salary/1e4)}万円/月
                </div>

                <button class="btn-primary candidate-hire-btn" onclick="hireSelectedCandidate(${n})"
                        style="width: 100%; margin-top: 8px;">
                    ✅ 採用する
                </button>
            </div>
        `}).join("")}function Zm(e,t=!1){const n=$t[e];if(!n)return;const i=Object.entries(n.impact||{}).map(([r,c])=>`<li>${r}: ${c>0?"+":""}${c}%</li>`).join(""),o=t||window.hireCandidates?"closeDetailModal()":"closeModal()",a=`
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${n.emoji}</div>
            <h3 style="margin: 0 0 8px 0; color: ${n.negative?"#f44336":"#4caf50"};">
                ${n.name}
            </h3>
            <div style="display: inline-block; padding: 4px 12px; background: ${n.negative?"rgba(244, 67, 54, 0.1)":"rgba(76, 175, 80, 0.1)"}; border-radius: 12px; font-size: 11px; margin-bottom: 16px;">
                ${n.negative?"⚠️ ネガティブ":"✨ ポジティブ"}
            </div>
            <div style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 12px;">
                ${n.effect}
            </div>
            ${i?`
                <div style="background: rgba(240, 240, 240, 0.5); padding: 12px; border-radius: 8px; margin-top: 12px; text-align: left;">
                    <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">📊 効果:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                        ${i}
                    </ul>
                </div>
            `:""}
            <button class="btn-primary" onclick="${o}" style="margin-top: 16px; width: 100%;">
                閉じる
            </button>
        </div>
    `;B("",a,!0)}function Fm(e,t=!1){const n=le[e];if(!n)return;const i=Object.entries(n.effects||{}).map(([d,u])=>`<li>${{developmentSpeed:"開発速度",bugRate:"バグ発生率",teamEfficiency:"チーム効率",salesBonus:"営業ボーナス",planningBonus:"企画ボーナス",managementBonus:"管理ボーナス",learningSpeed:"学習速度",creativity:"創造性"}[d]||d}: ${u>0?"+":""}${u}%</li>`).join(""),o=n.compatible?.map(d=>le[d]?.name).filter(Boolean).join("、")||"なし",a=n.incompatible?.map(d=>le[d]?.name).filter(Boolean).join("、")||"なし",r=t||window.hireCandidates?"closeDetailModal()":"closeModal()",c=`
        <div style="padding: 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${n.emoji}</div>
            <h3 style="margin: 0 0 16px 0; color: #667eea;">
                ${n.name}
            </h3>
            <div style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 16px; text-align: left;">
                ${n.description||""}
            </div>
            ${i?`
                <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 12px; text-align: left;">
                    <div style="font-weight: 600; margin-bottom: 6px; font-size: 12px;">📊 効果:</div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                        ${i}
                    </ul>
                </div>
            `:""}
            <div style="background: rgba(76, 175, 80, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 8px; text-align: left;">
                <div style="font-weight: 600; font-size: 11px; color: #4caf50; margin-bottom: 4px;">✅ 相性良い:</div>
                <div style="font-size: 12px;">${o}</div>
            </div>
            <div style="background: rgba(244, 67, 54, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 16px; text-align: left;">
                <div style="font-weight: 600; font-size: 11px; color: #f44336; margin-bottom: 4px;">❌ 相性悪い:</div>
                <div style="font-size: 12px;">${a}</div>
            </div>
            <button class="btn-primary" onclick="${r}" style="width: 100%;">
                閉じる
            </button>
        </div>
    `;B("",c,!0)}function qm(e){if(!_e())return;const t=Object.keys(ue).map(i=>{const o=ue[i],a=i===e.department;return`
            <button onclick="changeDepartment(${e.id}, '${i}')"
                    class="dept-option ${a?"current":""}"
                    ${a?"disabled":""}>
                <div class="dept-emoji">${o.emoji}</div>
                <div class="dept-name">${o.name}</div>
                <div class="dept-desc">${o.description}</div>
                ${a?'<div class="current-badge">現在の部署</div>':""}
            </button>
        `}).join(""),n=`
        <div style="margin: 16px 0;">
            <p style="margin-bottom: 16px; color: #666;">
                ${j(e.name)}の配属先を変更します
            </p>
            <div class="dept-options-grid">
                ${t}
            </div>
        </div>
    `;B("🏢 部署異動",n,!0)}function Ga(e){const t=le[e.personalityKey]||le.logical;let n=`
        <div class="employee-detail-header">
            <div class="employee-detail-icon">${t.emoji}</div>
            <div class="employee-detail-info">
                <div class="employee-detail-name">${j(e.name)}</div>
                <div class="employee-detail-meta">
                    ${t.name} | 💰 月給 ${Math.floor(e.salary/1e4)}万円
                </div>
            </div>
        </div>
    `;const i=`
        <div style="margin-bottom: 16px; padding: 12px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #667eea; cursor: pointer; text-decoration: underline; text-decoration-style: dotted;"
                 onclick="showPersonalityDetail('${e.personalityKey}')"
                 title="クリックで詳細を表示">
                ${t.emoji} ${t.name}
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
                ${Object.entries(t.effects||{}).map(([A,D])=>{const O={developmentSpeed:"開発速度",bugRate:"バグ発生率",teamEfficiency:"チーム効率",salesBonus:"営業ボーナス",planningBonus:"企画ボーナス",managementBonus:"管理ボーナス",learningSpeed:"学習速度",creativity:"創造性",motivation:"モチベーション"},Z=A==="bugRate"&&D>1||D<1,Q=D>1?`+${Math.round((D-1)*100)}%`:`${Math.round((1-D)*100)}%減`;return`<div style="display: flex; justify-content: space-between; margin: 4px 0;">
                        <span>📊 ${O[A]||A}</span>
                        <span style="font-weight: 600; color: ${Z?"#f44336":"#4caf50"};">${Q}</span>
                    </div>`}).join("")}
            </div>
            ${t.compatible?`
                <div style="font-size: 12px; color: #4caf50; margin-top: 8px;">
                    ✅ 相性良好: ${t.compatible.map(A=>le[A]?.name||A).join(", ")}
                </div>
            `:""}
            ${t.incompatible?`
                <div style="font-size: 12px; color: #f44336; margin-top: 4px;">
                    ❌ 相性悪い: ${t.incompatible.map(A=>le[A]?.name||A).join(", ")}
                </div>
            `:""}
        </div>
    `;let o="";if(e.qualification&&typeof De<"u"&&De[e.qualification]){const D=typeof mn=="function"?mn(e.qualification):"",O=typeof fn=="function"?fn(e.qualification):"";o=`
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 215, 0, 0.05); border-radius: 12px; border: 2px solid rgba(255, 215, 0, 0.3);">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #FFD700;">🎓 保有資格</div>
                    ${D}
                    ${O}
                </div>
            `}let a="";if(e.subTraits&&e.subTraits.length>0&&(a=`
            <div style="margin-bottom: 16px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #667eea;">
                    🌟 特性
                    <span style="font-size: 10px; color: #999; font-weight: normal;">（クリックで詳細）</span>
                </div>
                <div style="display: grid; gap: 8px;">
                    ${e.subTraits.map(A=>{const D=$t[A];return D?`
                            <div style="padding: 10px; background: ${D.negative?"rgba(244, 67, 54, 0.05)":"rgba(76, 175, 80, 0.05)"}; border-radius: 8px; border-left: 3px solid ${D.negative?"#f44336":"#4caf50"}; cursor: pointer; transition: transform 0.2s;"
                                 onclick="showTraitDetail('${A}')"
                                 onmouseover="this.style.transform='scale(1.02)'"
                                 onmouseout="this.style.transform='scale(1)'"
                                 title="クリックで詳細を表示">
                                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span class="trait-badge ${D.negative?"negative":"positive"}" style="margin: 0;">
                                        ${D.emoji} ${D.name}
                                    </span>
                                </div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    ${D.effect}
                                </div>
                            </div>
                        `:""}).join("")}
                </div>
            </div>
        `),e.hiddenTraitRevealed){const A=Ue[e.hiddenTrait];a+=`
            <div style="margin-bottom: 16px;">
                <span class="trait-badge hidden">
                    ✨ ${A.emoji} ${A.name}
                </span>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    ${A.effect}
                </div>
            </div>
        `}const r=`
        <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #667eea;">📊 能力値</div>
            <div class="radar-chart-container">
                <canvas id="employeeRadarChart"></canvas>
            </div>
        </div>
    `,c=e.temperament?`
        <div style="margin-bottom: 16px; padding: 16px; background: rgba(255, 215, 0, 0.05); border-radius: 12px; border: 1px solid rgba(255, 215, 0, 0.2);">
            <div style="font-weight: 600; margin-bottom: 12px; color: #f59e0b;">🎭 気質パラメータ</div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 13px;">
                ${Object.keys(eo).map(A=>{const D=eo[A],O=e.temperament[A]||50,Z=Math.min(100,Math.max(0,O)),Q=Z>=70?"#10b981":Z>=40?"#f59e0b":"#ef4444",S=Z>=70;return`
                        <div style="margin-bottom: 4px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                <span style="font-weight: 500;">${D.emoji} ${D.name}</span>
                                <span style="font-weight: 600; color: ${Q};">${Z}${S?" ⭐":""}</span>
                            </div>
                            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${Z}%; height: 100%; background: ${Q}; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    `}).join("")}
            </div>
            <div style="font-size: 11px; color: #999; margin-top: 12px; text-align: center;">
                💡 70以上で強み、40未満で弱みとして影響
            </div>
        </div>
    `:"",d=ue[e.department],u=be[e.position],v=Ci(e),f=`
        <div style="margin-bottom: 16px; padding: 16px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
            <div style="font-weight: 600; margin-bottom: 12px; color: #667eea;">💼 所属・役職</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div>
                    <div style="font-size: 11px; color: #999; margin-bottom: 4px;">部署</div>
                    <div style="font-weight: 600;">${d.emoji} ${d.name}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">${d.description}</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: #999; margin-bottom: 4px;">役職</div>
                    <div style="font-weight: 600;">${u.emoji} ${u.name}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">${u.description}</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
                <button onclick="showDepartmentChangeModal(game.employees.find(e => e.id === ${e.id}))"
                        class="btn-secondary">
                    🏢 部署異動
                </button>
                <button onclick="showSkillTreeModal(game.employees.find(e => e.id === ${e.id}))"
                        class="btn-secondary" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)); border-color: rgba(102, 126, 234, 0.5);">
                    🌳 スキルツリー ${(e.skillPoints||0)>0?`<strong style="color: #667eea;">(${e.skillPoints}SP)</strong>`:""}
                </button>
                ${v?`
                    <button onclick="promoteEmployee(${e.id})"
                            class="btn-primary" style="grid-column: 1 / -1;">
                        ⭐ 昇進させる
                    </button>
                `:`
                    <button disabled class="btn-secondary" style="grid-column: 1 / -1; opacity: 0.5;">
                        🔒 昇進不可
                    </button>
                `}
            </div>
            ${!v&&e.position!=="director"?`
                <div style="font-size: 11px; color: #999; margin-top: 8px; text-align: center;">
                    💡 平均能力${be[["senior","manager","director"][["staff","senior","manager"].indexOf(e.position)+1]]?.requiredAbility||100}以上で昇進可能
                </div>
            `:""}
        </div>
    `,y=`
        <div class="growth-timeline">
            <div class="timeline-title">
                📈 成長履歴
            </div>
            ${(e.growthHistory||[]).map(A=>`
                <div class="timeline-item">
                    <div class="timeline-turn">第${A.turn}週</div>
                    <div class="timeline-event">${j(A.event)}</div>
                    <div class="timeline-description">${j(A.description)}</div>
                </div>
            `).join("")}
        </div>
    `,$=n+i+o+a+r+c+f+y;document.getElementById("modalTitle").textContent="👤 従業員詳細";const T=document.getElementById("modalBody");ae(E`${Sa($)}`,T),document.getElementById("modal").classList.add("active","employee-detail-modal"),setTimeout(()=>{Um(e)},50)}function Um(e){Ha();const t=document.getElementById("employeeRadarChart");t&&(Qe&&(Qe.destroy(),Qe=null),Qe=new bn(t,{type:"radar",data:{labels:["技術力","営業力","企画力","管理力"],datasets:[{label:"能力値",data:[e.abilities.technical,e.abilities.sales,e.abilities.planning,e.abilities.management],backgroundColor:"rgba(102, 126, 234, 0.2)",borderColor:"#667eea",borderWidth:2,pointBackgroundColor:"#667eea",pointBorderColor:"#fff",pointHoverBackgroundColor:"#fff",pointHoverBorderColor:"#667eea"}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{r:{beginAtZero:!0,max:100,ticks:{stepSize:20},grid:{color:"rgba(0, 0, 0, 0.1)"},angleLines:{color:"rgba(0, 0, 0, 0.1)"}}},plugins:{legend:{display:!1}}}}))}function Ya(e){const t=Object.keys(ze),n=t.map((a,r)=>{const c=ze[a];return`
            <button
                class="skill-tab ${r===0?"active":""}"
                onclick="switchSkillCategory('${a}')"
                data-category="${a}"
                style="background: ${r===0?c.color:"rgba(255,255,255,0.1)"};">
                ${c.emoji} ${c.name}
            </button>
        `}).join(""),i=t.map((a,r)=>{const c=ze[a],d=Object.keys(c.skills).map(u=>{const v=c.skills[u],f=e.unlockedSkills.includes(u),y=Si(e,a,u),$=!f&&!y;let T="";v.prerequisites&&v.prerequisites.length>0&&(T=`
                    <div style="font-size: 11px; color: #999; margin-top: 8px;">
                        前提: ${v.prerequisites.map(O=>{const Z=Object.keys(ze).find(G=>ze[G].skills[O]),Q=Z?ze[Z].skills[O]:null,S=e.unlockedSkills.includes(O);return Q?`<span style="color: ${S?"#4caf50":"#f44336"};">${Q.icon} ${Q.name}</span>`:O}).join(", ")}
                    </div>
                `);const L=v.special?Bo[v.special]:null,A=L?`<div style="font-size: 11px; color: #f093fb; margin-top: 6px;">✨ ${L.description}</div>`:"";return`
                <div class="skill-card ${f?"unlocked":""} ${$?"locked":""} ${y?"can-unlock":""}"
                     onclick="${y?`unlockSkill(${e.id}, '${a}', '${u}')`:""}"
                     style="cursor: ${y?"pointer":"default"}; opacity: ${$?"0.4":"1"};">
                    <div style="font-size: 32px; margin-bottom: 8px;">${v.icon}</div>
                    <div style="font-weight: 600; margin-bottom: 4px; color: ${f?"#4caf50":y?c.color:"#666"};">
                        ${v.name}
                        ${f?" ✓":""}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                        ${v.description}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 4px;">
                        ${Object.entries(v.effect||{}).map(([D,O])=>`<span style="color: ${c.color};">${D}+${O}</span>`).join(" ")}
                    </div>
                    ${A}
                    ${T}
                    <div style="margin-top: 8px; font-size: 12px; font-weight: 600; color: ${y?c.color:"#999"};">
                        ${f?"習得済み":`コスト: ${v.cost}SP`}
                    </div>
                </div>
            `}).join("");return`
            <div class="skill-panel ${r===0?"active":""}" data-category="${a}">
                <div class="skill-grid">
                    ${d}
                </div>
            </div>
        `}).join(""),o=`
        <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; color: #667eea;">🌳 ${j(e.name)} のスキルツリー</h3>
                <div style="background: rgba(102, 126, 234, 0.15); padding: 8px 16px; border-radius: 20px; font-weight: 600; color: #667eea;">
                    💎 ${e.skillPoints} SP
                </div>
            </div>

            <div class="skill-tabs">
                ${n}
            </div>

            ${i}

            <div style="margin-top: 16px; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px; font-size: 13px; color: #666;">
                💡 ヒント: 研修や昇進でスキルポイントを獲得できます。スキルを習得すると能力値がアップします！
            </div>
        </div>
    `;B("",o,!0)}function Hm(e){document.querySelectorAll(".skill-tab").forEach(t=>{const n=t,i=n.dataset.category===e;if(n.classList.toggle("active",i),i){const o=ze[e]?.color||"#667eea";n.style.background=o}else n.style.background="rgba(255,255,255,0.1)"}),document.querySelectorAll(".skill-panel").forEach(t=>{const n=t;n.classList.toggle("active",n.dataset.category===e)})}function Wm(){if(!_e())return;const e=N();if(e.employees.length===0){B("研修失敗","従業員がいません");return}const t=3e5*e.employees.length;if(e.money<t){B("研修失敗",`資金不足です（必要: ${t/1e4}万円）`);return}const n=`
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                    研修の方向性を選択してください
                </div>
                <div style="font-size: 12px; color: #999;">
                    💰 費用: ${t/1e4}万円 | 👥 対象: ${e.employees.length}名
                </div>
            </div>

            <div style="display: grid; gap: 12px;">
                <button class="btn-primary" onclick="executeTraining('balanced')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">⚖️</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">バランス型研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">全能力をまんべんなく向上（基本+10）</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('technical')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #667eea, #764ba2);">
                    <span style="font-size: 24px;">⚙️</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">技術力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">技術力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('sales')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f093fb, #f5576c);">
                    <span style="font-size: 24px;">💼</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">営業力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">営業力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('planning')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #4facfe, #00f2fe);">
                    <span style="font-size: 24px;">📋</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">企画力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">企画力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeTraining('management')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #43e97b, #38f9d7);">
                    <span style="font-size: 24px;">👔</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">管理力特化研修</div>
                        <div style="font-size: 11px; opacity: 0.8;">管理力+15、その他+5</div>
                    </div>
                </button>

                <button class="btn-secondary" onclick="closeModal()"
                        style="padding: 12px; margin-top: 8px;">
                    キャンセル
                </button>
            </div>
        </div>
    `;B("📚 研修プログラム選択",n,!0)}function Vm(){if(!_e())return;const e=N(),t=1e6;if(e.money<t){B("実施失敗",`資金不足です（${t/1e4}万円必要）`);return}const n=`
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                    マーケティング戦略を選択してください
                </div>
                <div style="font-size: 12px; color: #999;">
                    💰 費用: ${t/1e4}万円
                </div>
            </div>

            <div style="display: grid; gap: 12px;">
                <button class="btn-primary" onclick="executeMarketing('balanced')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">⚖️</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">バランス型キャンペーン</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.3%、ブランド力+1.0</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('brand')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #667eea, #764ba2);">
                    <span style="font-size: 24px;">🌟</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">ブランド重視</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.2%、ブランド力+2.0</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('share')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #f093fb, #f5576c);">
                    <span style="font-size: 24px;">📈</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">シェア拡大重視</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.5%、ブランド力+0.5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('niche')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #4facfe, #00f2fe);">
                    <span style="font-size: 24px;">🎯</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">ニッチ戦略</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.1%、ブランド力+1.5</div>
                    </div>
                </button>

                <button class="btn-primary" onclick="executeMarketing('lowprice')"
                        style="padding: 15px; text-align: left; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #43e97b, #38f9d7);">
                    <span style="font-size: 24px;">💰</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">低価格戦略</div>
                        <div style="font-size: 11px; opacity: 0.8;">シェア+0.6%、ブランド力-0.3</div>
                    </div>
                </button>

                <button class="btn-secondary" onclick="closeModal()"
                        style="padding: 12px; margin-top: 8px;">
                    キャンセル
                </button>
            </div>
        </div>
    `;B("📢 マーケティング戦略選択",n,!0)}let Et=null,Yn=null;function Gm(){Ha();const e=N(),t=document.getElementById("revenueChart");t&&(Et=new bn(t,{type:"line",data:{labels:e.revenueHistory.map((i,o)=>`${o+1}月`),datasets:[{label:"売上（万円）",data:e.revenueHistory.map(i=>i/1e4),borderColor:"#667eea",backgroundColor:"rgba(102, 126, 234, 0.1)",tension:.4,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0}}}})),document.getElementById("marketChart")&&Ai()}function Ym(){const e=N(),t=vt();Et&&(Et.data.labels=e.revenueHistory.map((n,i)=>`${i+1}月`),Et.data.datasets[0].data=e.revenueHistory.map(n=>n/1e4),Et.update()),t==="market"&&Ai()}function Ai(){const e=N(),t=xt(),n=document.getElementById("marketChart");if(!n)return;Yn&&Yn.destroy();const i=[...t.map(o=>({name:o.name,share:o.share})),{name:"あなた",share:e.marketShare}];Yn=new bn(n,{type:"doughnut",data:{labels:i.map(o=>o.name),datasets:[{data:i.map(o=>o.share),backgroundColor:["#667eea","#764ba2","#f093fb","#ffd700"]}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom"}}}})}function Km(e,t){const n=ya[e.category]||e.category,i=ba[e.priority],o=(t.ceo?.remandsThisWeek||0)<1?1:0,a=t.money>=5e4;let r="";e.clues.length>0&&(r=`
      <div class="doc-clues">
        <h4>📝 気になる点</h4>
        ${e.clues.map(f=>`
          <div class="doc-clue-item">
            <span class="doc-clue-field">${j(f.field)}</span>
            <span class="doc-clue-obs">${j(f.observation)}</span>
          </div>
        `).join("")}
      </div>
    `);let c="";e.investigationResult&&(c=`
      <div class="doc-investigation-result">
        <h4>🔍 調査報告</h4>
        <p>${j(e.investigationResult)}</p>
      </div>
    `);let d="";if(e.deadline){const f=e.deadline-t.turn;d=`<div class="doc-deadline" style="color:${f<=1?"#e74c3c":f<=3?"#e67e22":"#2ecc71"}">⏰ 期限: あと${f}ターン</div>`}const u=e.verdict==="approve"||e.verdict==="reject",v=u?"disabled":"";return`
    <div class="doc-detail">
      <div class="doc-detail-header">
        <div class="doc-category-badge" style="background:${i.color}20;color:${i.color}">
          ${i.emoji} ${i.label} | ${n}
        </div>
        ${d}
      </div>

      <h3 class="doc-detail-title">${j(e.title)}</h3>

      <div class="doc-submitter">
        <span>提出者: ${j(e.submitter.name)}（${j(e.department)}部・${j(e.submitter.position)}）</span>
      </div>

      <div class="doc-summary">
        <h4>概要</h4>
        <p>${j(e.summary)}</p>
      </div>

      <div class="doc-details-grid">
        <div class="doc-detail-item">
          <span class="doc-detail-label">💰 金額</span>
          <span class="doc-detail-value">${Math.floor(e.details.amount/1e4).toLocaleString()}万円</span>
        </div>
        <div class="doc-detail-item">
          <span class="doc-detail-label">📈 期待効果</span>
          <span class="doc-detail-value">${j(e.details.expectedBenefit)}</span>
        </div>
        <div class="doc-detail-item">
          <span class="doc-detail-label">📅 タイムライン</span>
          <span class="doc-detail-value">${j(e.details.timeline)}</span>
        </div>
        <div class="doc-detail-item">
          <span class="doc-detail-label">⚠️ リスク</span>
          <span class="doc-detail-value">${j(e.details.risks)}</span>
        </div>
        ${e.details.attachments.length>0?`
          <div class="doc-detail-item">
            <span class="doc-detail-label">📎 添付</span>
            <span class="doc-detail-value">${e.details.attachments.map(f=>j(f)).join(", ")}</span>
          </div>
        `:""}
      </div>

      ${r}
      ${c}

      ${u?`
        <div class="doc-verdict-result">
          <p>${j(e.outcome?.description||"処理済み")}</p>
        </div>
      `:`
        <div class="doc-verdict-buttons">
          <button class="btn desk-btn approve-btn" onclick="verdictDocument('${j(e.id)}','approve')" ${v}>
            ✅ 承認
          </button>
          <button class="btn desk-btn reject-btn" onclick="verdictDocument('${j(e.id)}','reject')" ${v}>
            ❌ 却下
          </button>
          <button class="btn desk-btn hold-btn" onclick="verdictDocument('${j(e.id)}','hold')" ${v}>
            ⏸️ 保留
          </button>
          <button class="btn desk-btn remand-btn" onclick="verdictDocument('${j(e.id)}','remand')" ${v} ${o<=0?'disabled title="今週の差し戻し上限に達しています"':""}>
            🔄 差し戻し(残${o}回)
          </button>
          <button class="btn desk-btn investigate-btn" onclick="verdictDocument('${j(e.id)}','investigate')" ${v} ${a?"":'disabled title="調査費用が不足しています"'}>
            🔍 調査(5万円)
          </button>
        </div>
      `}
    </div>
  `}function Qm(e){if(!e.outcome)return"";const t=[];if(e.outcome.moneyChange!==0){const n=e.outcome.moneyChange>=0?"#2ecc71":"#e74c3c";t.push(`<span style="color:${n}">💰 ${e.outcome.moneyChange>=0?"+":""}${Math.floor(e.outcome.moneyChange/1e4)}万円</span>`)}if(e.outcome.ceoApprovalChange!==0){const n=e.outcome.ceoApprovalChange>=0?"#2ecc71":"#e74c3c";t.push(`<span style="color:${n}">📊 支持率 ${e.outcome.ceoApprovalChange>=0?"+":""}${e.outcome.ceoApprovalChange}</span>`)}if(e.outcome.marketShareChange!==0){const n=e.outcome.marketShareChange>=0?"#2ecc71":"#e74c3c";t.push(`<span style="color:${n}">📈 シェア ${e.outcome.marketShareChange>=0?"+":""}${e.outcome.marketShareChange.toFixed(1)}%</span>`)}if(e.outcome.employeeMoraleChange!==0){const n=e.outcome.employeeMoraleChange>=0?"#2ecc71":"#e74c3c";t.push(`<span style="color:${n}">😊 士気 ${e.outcome.employeeMoraleChange>=0?"+":""}${e.outcome.employeeMoraleChange}</span>`)}return`
    <div class="verdict-result">
      <h4>📋 決裁結果</h4>
      <p>${j(e.outcome.description)}</p>
      <div class="verdict-changes">
        ${t.join(" | ")}
      </div>
    </div>
  `}const z=N();function Jm(e){if(!_e())return;if(z.money<e.salary*3){B("採用失敗","資金不足です（3ヶ月分の給与が必要）");return}z.money-=e.salary*3,z.employees.push(e);const t=Ba(e),n=e.name||`社員${e.id}`;Pt.addCharacter(String(e.id),n,t,()=>{Ga(e)}),window.currentCandidate=null,ve(),he(),Ce(),B("🎉 採用成功",`${j(e.name)}さんを採用しました！`),Ei("hire_employee")}function Xm(e,t){if(!_e())return;const n=z.employees.find(a=>a.id===e);if(!n){B("エラー","従業員が見つかりません");return}if(n.department===t){B("異動失敗","すでにその部署に所属しています");return}const i=ue[n.department],o=ue[t];n.department=t,n.growthHistory||(n.growthHistory=[]),n.growthHistory.push({turn:z.turn,event:"部署異動",description:`${i.emoji} ${i.name} から ${o.emoji} ${o.name} へ異動`}),ve(),he(),Ce(),B("🎉 異動完了",`${j(n.name)}を${o.emoji} ${o.name}に異動させました！`)}function ef(e){if(!_e())return;const t=z.employees.find(f=>f.id===e);if(!t){B("エラー","従業員が見つかりません");return}if(!Ci(t)){B("昇進不可","昇進に必要な能力値を満たしていません");return}const n=["staff","senior","manager","director"],i=n.indexOf(t.position),o=n[i+1],a=be[t.position],r=be[o];t.position=o;const c=t.salary/a.salaryMultiplier;t.salary=Math.floor(c*r.salaryMultiplier);const u={senior:3,manager:5,director:10}[o]||0;t.skillPoints=(t.skillPoints||0)+u,t.growthHistory||(t.growthHistory=[]),t.growthHistory.push({turn:z.turn,event:"昇進",description:`${a.emoji} ${a.name} から ${r.emoji} ${r.name} へ昇進！ | スキルポイント+${u}`}),ve(),he(),Ce();const v=`
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
            <h2 style="color: #667eea; margin-bottom: 12px;">昇進おめでとうございます!</h2>
            <p style="font-size: 18px; margin-bottom: 8px;">${j(t.name)}</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                ${a.emoji} ${a.name} → ${r.emoji} ${r.name}
            </p>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 12px; margin-top: 16px;">
                <div>💰 新しい給与: ${Math.floor(t.salary/1e4)}万円</div>
                ${r.canManage?`<div style="margin-top: 8px;">👥 管理可能人数: ${r.canManage}名</div>`:""}
                ${u>0?`<div style="margin-top: 8px; color: #667eea; font-weight: 600;">🌳 スキルポイント+${u}獲得!</div>`:""}
            </div>
        </div>
    `;B("",v,!0)}function tf(e,t,n){if(!_e())return;const i=z.employees.find(d=>d.id===e);if(!i){B("エラー","従業員が見つかりません");return}const o=ze[t]?.skills[n];if(!o){B("エラー","スキルが見つかりません");return}if(!Si(i,t,n)){let d="";i.unlockedSkills.includes(n)?d="既に獲得済みです":i.skillPoints<o.cost?d=`スキルポイントが不足しています (必要: ${o.cost}, 現在: ${i.skillPoints})`:d="前提スキルを先に獲得してください",B("スキル獲得不可",d);return}i.skillPoints-=o.cost,i.unlockedSkills.push(n),o.effect&&Object.keys(o.effect).forEach(d=>{i.abilities[d]!==void 0&&(i.abilities[d]=Math.min(100,i.abilities[d]+o.effect[d]))}),i.growthHistory||(i.growthHistory=[]);const a=Object.entries(o.effect||{}).map(([d,u])=>`${d}+${u}`).join(", ");i.growthHistory.push({turn:z.turn,event:"スキル獲得",description:`${o.icon} ${o.name} を習得！ (${a})`}),ve(),he();const r=o.special?Bo[o.special]:null,c=`
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">${o.icon}</div>
            <h2 style="color: #667eea; margin-bottom: 12px;">スキル習得!</h2>
            <p style="font-size: 18px; margin-bottom: 8px;">${j(i.name)}</p>
            <p style="font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 12px;">
                ${o.name}
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
                ${o.description}
            </p>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 12px; margin-top: 16px;">
                <div style="font-weight: 600; margin-bottom: 8px;">📈 効果</div>
                ${Object.entries(o.effect||{}).map(([d,u])=>`<div>${d}: +${u}</div>`).join("")}
                ${r?`<div style="margin-top: 8px; color: #f093fb; font-weight: 600;">✨ ${r.description}</div>`:""}
            </div>
            <div style="margin-top: 12px; font-size: 14px; color: #999;">
                残りスキルポイント: ${i.skillPoints}
            </div>
        </div>
    `;B("",c,!0),setTimeout(()=>{Ya(i)},100)}function nf(e){if(!_e())return;const t=3e5*z.employees.length;if(z.money<t){B("研修失敗",`資金不足です（${Math.floor(t/1e4)}万円必要）`);return}Ce(),z.money-=t;let n=[],i=[];z.employees.forEach(r=>{let c=10;r.subTraits&&r.subTraits.includes("fast_learner")&&(c=Math.floor(c*1.5),n.push(`${j(r.name)}は早習得で効果アップ！`)),r.personalityKey==="researcher"&&(c=Math.floor(c*1.3),n.push(`${j(r.name)}は研究者気質で効果アップ！`));const d={balanced:{technical:1,sales:1,planning:1,management:1},technical:{technical:1.5,sales:.5,planning:.5,management:.5},sales:{technical:.5,sales:1.5,planning:.5,management:.5},planning:{technical:.5,sales:.5,planning:1.5,management:.5},management:{technical:.5,sales:.5,planning:.5,management:1.5}},u=d[e]||d.balanced;let v=0;Object.keys(r.abilities).forEach(T=>{const L=r.abilities[T],A=Ma(L),D=u[T]||1,O=Math.max(1,Math.floor(c*A*D));r.abilities[T]=Math.min(100,L+O),v+=O});const f=Math.floor(v/4),y=Math.max(1,Math.floor(f/3));r.skillPoints=(r.skillPoints||0)+y;const $={balanced:"バランス型",technical:"技術力特化",sales:"営業力特化",planning:"企画力特化",management:"管理力特化"};r.growthHistory||(r.growthHistory=[]),r.growthHistory.push({turn:z.turn,event:`研修（${$[e]||"バランス型"}）`,description:`研修を受けて平均+${f}上昇 | スキルポイント+${y}`}),y>0&&n.push(`${j(r.name)}はスキルポイント+${y}を獲得！`),i.push({name:r.name,growth:f})}),ve(),he();let a=`📚 ${{balanced:"バランス型",technical:"技術力特化",sales:"営業力特化",planning:"企画力特化",management:"管理力特化"}[e]||"バランス型"}研修を実施しました！<br><br>`;a+='<div style="font-size: 13px; line-height: 1.6;">',i.forEach(r=>{a+=`<div>✨ ${j(r.name)}: 平均 +${r.growth}</div>`}),a+="</div>",n.length>0&&(a+="<br><strong>🌟 ボーナス効果:</strong><br>"+n.join("<br>")),a+='<br><br><small style="color: #666;">💡 高能力者は成長が鈍化します (70+: 60%, 80+: 40%, 90+: 20%)</small>',B("📚 研修完了",a,!0)}function of(){if(!_e())return;if(z.employees.length<2){B("開発失敗","最低2名の従業員が必要です");return}if(z.money<2e6){B("開発失敗","資金不足です（200万円必要）");return}z.money-=2e6;const e=ki(z.employees),t=z.employees.reduce((f,y)=>f+y.abilities.technical,0)/z.employees.length;let n=1,i=[];z.employees.filter(f=>f.personalityKey==="perfectionist").length>0&&(n*=1.2,i.push("完璧主義者がいて品質アップ！")),z.employees.filter(f=>f.personalityKey==="lone_genius").length>0&&(n*=1.4,i.push("孤高の天才の力で大幅品質アップ！")),z.employees.filter(f=>f.subTraits&&f.subTraits.includes("architect")).length>0&&(n*=1.5,i.push("アーキテクトの設計力で品質向上！")),n*=e;const c=Math.floor(50+t/2+Math.random()*20),d=Math.min(100,Math.floor(c*n)),u={id:Date.now(),name:`製品${z.products.length+1}`,quality:d,sales:0};z.products.push(u),ve(),he();let v=`${u.name}を開発しました！<br>品質: ${d}%`;i.length>0&&(v+="<br><br><strong>ボーナス効果:</strong><br>"+i.join("<br>")),e!==1&&(v+=`<br>チーム相性: ${(e*100).toFixed(0)}%`),B("🔧 開発成功",v,!0),Ei("develop_product")}function af(e){Ce();const t=1e6;z.money-=t;const n={balanced:{share:.3,brand:1,name:"バランス型"},brand:{share:.2,brand:2,name:"ブランド重視"},share:{share:.5,brand:.5,name:"シェア拡大重視"},niche:{share:.1,brand:1.5,name:"ニッチ戦略"},lowprice:{share:.6,brand:-.3,name:"低価格戦略"}},i=n[e]||n.balanced;z.marketShare=Math.min(15,z.marketShare+i.share),z.brandPower=Math.max(0,Math.min(5,z.brandPower+i.brand)),ve(),he(),Ra();let o=`📢 ${i.name}キャンペーンを実施しました！<br><br>`;o+=`📊 市場シェア: +${i.share}% → ${z.marketShare.toFixed(2)}%<br>`,o+=`✨ ブランド力: ${i.brand>=0?"+":""}${i.brand} → ${z.brandPower.toFixed(1)}`,B("📢 マーケティング完了",o,!0)}function rf(){_e()&&(z.money+=on.LOAN_AMOUNT,z.debt+=on.LOAN_AMOUNT,ve(),he(),B("🏦 融資実行",`500万円の融資を受けました<br>利率: ${(on.LOAN_INTEREST_RATE*100).toFixed(1)}%/月`,!0))}function sf(){if(!_e())return;if(z.debt<=0){B("返済不要","現在の借入はありません");return}const e=Math.min(z.debt,z.money);if(e<=0){B("返済失敗","返済に充てる資金がありません");return}z.money-=e,z.debt-=e,ve(),he(),B("💸 返済完了",`${Math.floor(e/1e4)}万円を返済しました`)}function cf(e){const t=z.documentQueue.find(n=>n.id===e);t&&B("📋 書類詳細",Km(t,z),!0)}function lf(e,t){const n=Xu(z,e,t);if(!n)return;const i=z.documentHistory.find(o=>o.id===e)||z.documentQueue.find(o=>o.id===e);i&&i.outcome?B("📋 決裁結果",Qm(i),!0):B("📋 決裁結果",`<p>${j(n.description)}</p>`,!0),ve(),he()}function df(e,t){const n=mp(z,e,t);if(!n)return;const i=z.visitorHistory[z.visitorHistory.length-1];i&&B("🚪 訪問者対応完了",jp(i,n.effects),!0),ve(),he()}function uf(e){document.querySelectorAll(".desk-tab").forEach(i=>i.classList.remove("active"));const t=document.querySelector(`.desk-tab[onclick="switchDeskTab('${e}')"]`);t&&t.classList.add("active");const n=document.getElementById("deskTabContent");if(n)switch(e){case"documents":n.innerHTML=Ta(z);break;case"status":n.innerHTML=om(z);break;case"employees":n.innerHTML=im(z);break;case"directives":n.innerHTML=Ap(z);break}}function pf(e,t){_p(z,e,t),B("📢 指示完了",`${e==="development"?"開発":e==="sales"?"営業":e==="planning"?"企画":"管理"}部に指示を出しました。次のターンに書類が届きます。`)}let Fe=[];function mf(e){const t=Fe.indexOf(e);t>=0?Fe.splice(t,1):Fe.length<3&&Fe.push(e),document.querySelectorAll(".policy-option").forEach(n=>{const i=n.dataset.policy;i&&Fe.includes(i)?n.classList.add("selected"):n.classList.remove("selected")})}function ff(){if(Fe.length<2){B("⚠️ 方針選択","2つ以上の方針を選択してください。");return}bp(z,Fe),Fe=[],Ce(),ve(),he(),B("🎯 方針決定","経営方針が設定されました。方針に沿った書類の承認でボーナスが得られます。")}function gf(e){z.ceo=Hu(e),z.gameMode="ceo",yt("desk"),gn("ceo");const t=_a(z,3);z.documentQueue.push(...t),Ce(),Da(null,"desk"),ve(),B("🏢 社長就任",'<div style="text-align:center;"><div style="font-size:48px;margin:16px;">🏢</div><p>社長に就任しました！</p><p>デスクに届いた書類を処理し、会社を成長させましょう。</p></div>',!0)}window.game=z;window.init=_m;window.initWithSlot=bm;window.saveGame=km;window.restartGame=Cm;window.nextTurn=xm;window.initAnimationSystem=wm;window.syncEmployeeAnimations=Za;window.showPanel=Da;window.showModal=B;window.closeModal=Ce;window.closeDetailModal=Rm;window.showHiring=Om;window.showDepartmentSelectionForHiring=Wa;window.showHiringForDepartment=Nm;window.hireSelectedCandidate=Bm;window.hireEmployee=Jm;window.trainEmployees=Wm;window.executeTraining=nf;window.promoteEmployee=ef;window.showEmployeeDetail=Ga;window.changeDepartment=Xm;window.showDepartmentChangeModal=qm;window.showSkillTreeModal=Ya;window.switchSkillCategory=Hm;window.unlockSkill=tf;window.showPersonalityDetail=Fm;window.showTraitDetail=Zm;window.canPromote=Ci;window.canUnlockSkill=Si;window.developProduct=of;window.doMarketing=Vm;window.executeMarketing=af;window.getLoan=rf;window.repayLoan=sf;window.showAllAchievements=Pa;window.showAchievementUnlocked=Dm;window.checkAchievements=Tm;window.startTutorial=jm;window.advanceTutorial=Fa;window.skipTutorial=Im;window.toggleTutorial=Pm;window.advanceTutorialByAction=Ei;window.updateDisplay=ve;window.renderActivePanel=he;window.updateControls=Oa;window.updateRanking=Ra;window.updateCharts=Ym;window.updateMarketChart=Ai;window.initCharts=Gm;window.generateNews=Em;window.updateCompetitors=Am;window.renderAchievements=za;window.generateCandidate=ja;window.generateCandidateForDepartment=rn;window.calculateTeamCompatibility=ki;window.calculateGrowthMultiplier=Ma;window.escapeHtml=j;window.requireCompanyActive=_e;window.openDocument=cf;window.verdictDocument=lf;window.respondToVisitor=df;window.switchDeskTab=uf;window.issueDirectiveAction=pf;window.togglePolicyFocus=mf;window.confirmPolicySelection=ff;window.selectCEOTrait=gf;const fe=e=>(t,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const hf={attribute:!0,type:String,converter:un,reflect:!1,hasChanged:$i},vf=(e=hf,t,n)=>{const{kind:i,metadata:o}=n;let a=globalThis.litPropertyMetadata.get(o);if(a===void 0&&globalThis.litPropertyMetadata.set(o,a=new Map),i==="setter"&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),i==="accessor"){const{name:r}=n;return{set(c){const d=t.get.call(this);t.set.call(this,c),this.requestUpdate(r,d,e,!0,c)},init(c){return c!==void 0&&this.C(r,void 0,e,c),c}}}if(i==="setter"){const{name:r}=n;return function(c){const d=this[r];t.call(this,c),this.requestUpdate(r,d,e,!0,c)}}throw Error("Unsupported decorator location: "+i)};function R(e){return(t,n)=>typeof n=="object"?vf(e,t,n):((i,o,a)=>{const r=o.hasOwnProperty(a);return o.constructor.createProperty(a,i),r?Object.getOwnPropertyDescriptor(o,a):void 0})(e,t,n)}function Ka(e){return R({...e,state:!0,attribute:!1})}var yf=Object.defineProperty,bf=Object.getOwnPropertyDescriptor,V=(e,t,n,i)=>{for(var o=i>1?void 0:i?bf(t,n):t,a=e.length-1,r;a>=0;a--)(r=e[a])&&(o=(i?r(t,n,o):r(o))||o);return i&&o&&yf(t,n,o),o};const Me=me`
  * {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;

    /* Theme CSS Variables */
    --a2ui-primary: #667eea;
    --a2ui-primary-dark: #764ba2;
    --a2ui-success: #4CAF50;
    --a2ui-warning: #FF9800;
    --a2ui-danger: #F44336;
    --a2ui-info: #2196F3;
    --a2ui-text: #1a1a1a;
    --a2ui-text-muted: #666666;
    --a2ui-border: #e0e0e0;
    --a2ui-bg: #ffffff;
  }
`;let _t=class extends de{constructor(){super(...arguments),this.cardType="info",this.elevation="medium",this.animate=!1}render(){return E`
      <div class="card elevation-${this.elevation} type-${this.cardType} ${this.animate?"animate":""}">
        <slot></slot>
      </div>
    `}};_t.styles=[Me,me`
      :host {
        --card-bg: #ffffff;
        --card-border: #e0e0e0;
        --card-shadow: rgba(0, 0, 0, 0.1);
      }

      .card {
        background: var(--card-bg);
        border-radius: 16px;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--accent-color, #667eea);
      }

      /* Elevation */
      .elevation-low {
        box-shadow: 0 2px 4px var(--card-shadow);
      }
      .elevation-medium {
        box-shadow: 0 4px 12px var(--card-shadow);
      }
      .elevation-high {
        box-shadow: 0 8px 24px var(--card-shadow);
      }

      /* Card Types */
      .type-info { --accent-color: #2196F3; }
      .type-success { --accent-color: #4CAF50; }
      .type-warning { --accent-color: #FF9800; }
      .type-danger { --accent-color: #F44336; }
      .type-primary { --accent-color: #667eea; }

      /* Animation */
      .animate {
        animation: slideIn 0.4s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px var(--card-shadow);
      }
    `];V([R({type:String})],_t.prototype,"cardType",2);V([R({type:String})],_t.prototype,"elevation",2);V([R({type:Boolean})],_t.prototype,"animate",2);_t=V([fe("a2ui-card")],_t);let Ft=class extends de{constructor(){super(...arguments),this.variant="body",this.color=""}render(){const e=this.color?`color: ${this.color}`:"";return E`
      <p class="text ${this.variant}" style=${e||F}>
        <slot></slot>
      </p>
    `}};Ft.styles=[Me,me`
      .text {
        margin: 0;
        line-height: 1.5;
      }

      .h1 { font-size: 28px; font-weight: 700; margin-bottom: 16px; }
      .h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
      .h3 { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
      .h4 { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
      .body { font-size: 14px; font-weight: 400; }
      .caption { font-size: 12px; font-weight: 400; color: #666; }
    `];V([R({type:String})],Ft.prototype,"variant",2);V([R({type:String})],Ft.prototype,"color",2);Ft=V([fe("a2ui-text")],Ft);let qt=class extends de{constructor(){super(...arguments),this.icon="",this.size="medium"}render(){return E`<span class="icon ${this.size}">${this.icon}</span>`}};qt.styles=[Me,me`
      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .small { font-size: 16px; }
      .medium { font-size: 24px; }
      .large { font-size: 32px; }
    `];V([R({type:String})],qt.prototype,"icon",2);V([R({type:String})],qt.prototype,"size",2);qt=V([fe("a2ui-icon")],qt);let wt=class extends de{constructor(){super(...arguments),this.variant="primary",this.disabled=!1,this.icon=""}render(){return E`
      <button class="button ${this.variant}" ?disabled=${this.disabled}>
        ${this.icon?E`<span class="icon">${this.icon}</span>`:F}
        <slot></slot>
      </button>
    `}};wt.styles=[Me,me`
      .button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border: none;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }

      .secondary {
        background: #f0f0f0;
        color: #333;
      }
      .secondary:hover { background: #e0e0e0; }

      .outline {
        background: transparent;
        border: 2px solid #667eea;
        color: #667eea;
      }
      .outline:hover { background: rgba(102, 126, 234, 0.1); }

      .text {
        background: transparent;
        color: #667eea;
        padding: 8px 16px;
      }
      .text:hover { background: rgba(102, 126, 234, 0.1); }

      .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .icon { font-size: 18px; }
    `];V([R({type:String})],wt.prototype,"variant",2);V([R({type:Boolean})],wt.prototype,"disabled",2);V([R({type:String})],wt.prototype,"icon",2);wt=V([fe("a2ui-button")],wt);let He=class extends de{constructor(){super(...arguments),this.gap="12px",this.align="center",this.justify="start"}render(){return E`
      <div class="row" style="gap: ${this.gap}; align-items: ${this.align}; justify-content: ${He.JUSTIFY_MAP[this.justify]};">
        <slot></slot>
      </div>
    `}};He.JUSTIFY_MAP={start:"flex-start",center:"center",end:"flex-end",between:"space-between",around:"space-around"};He.styles=[Me,me`
      .row {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
    `];V([R({type:String})],He.prototype,"gap",2);V([R({type:String})],He.prototype,"align",2);V([R({type:String})],He.prototype,"justify",2);He=V([fe("a2ui-row")],He);let hn=class extends de{constructor(){super(...arguments),this.gap="12px"}render(){return E`
      <div class="column" style="gap: ${this.gap};">
        <slot></slot>
      </div>
    `}};hn.styles=[Me,me`
      .column {
        display: flex;
        flex-direction: column;
      }
    `];V([R({type:String})],hn.prototype,"gap",2);hn=V([fe("a2ui-column")],hn);let vn=class extends de{constructor(){super(...arguments),this.variant="info"}render(){return E`<span class="badge ${this.variant}"><slot></slot></span>`}};vn.styles=[Me,me`
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }

      .success { background: #E8F5E9; color: #2E7D32; }
      .warning { background: #FFF3E0; color: #E65100; }
      .danger { background: #FFEBEE; color: #C62828; }
      .info { background: #E3F2FD; color: #1565C0; }
      .neutral { background: #F5F5F5; color: #616161; }
    `];V([R({type:String})],vn.prototype,"variant",2);vn=V([fe("a2ui-badge")],vn);let it=class extends de{constructor(){super(...arguments),this.value=0,this.max=100,this.color="#667eea",this.showLabel=!1}render(){const e=this.max>0?Math.min(this.value/this.max*100,100):0;return E`
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${e}%; background: ${this.color};"></div>
        </div>
        ${this.showLabel?E`<div class="progress-label">${Math.round(e)}%</div>`:F}
      </div>
    `}};it.styles=[Me,me`
      .progress-container {
        width: 100%;
      }

      .progress-bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      .progress-label {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        text-align: right;
      }
    `];V([R({type:Number})],it.prototype,"value",2);V([R({type:Number})],it.prototype,"max",2);V([R({type:String})],it.prototype,"color",2);V([R({type:Boolean})],it.prototype,"showLabel",2);it=V([fe("a2ui-progress")],it);let yn=class extends de{constructor(){super(...arguments),this.spacing="16px"}render(){return E`<hr class="divider" style="margin: ${this.spacing} 0;" />`}};yn.styles=[Me,me`
      .divider {
        border: none;
        border-top: 1px solid #e0e0e0;
      }
    `];V([R({type:String})],yn.prototype,"spacing",2);yn=V([fe("a2ui-divider")],yn);let ot=class extends de{constructor(){super(...arguments),this.name="",this.emoji="",this.size="medium",this.bgColor="#667eea"}render(){const e=this.emoji||(this.name?this.name.charAt(0).toUpperCase():"?");return E`
      <div class="avatar ${this.size}" style="background: ${this.bgColor};">
        ${e}
      </div>
    `}};ot.styles=[Me,me`
      .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: white;
        font-weight: 600;
      }

      .small { width: 32px; height: 32px; font-size: 14px; }
      .medium { width: 48px; height: 48px; font-size: 20px; }
      .large { width: 64px; height: 64px; font-size: 28px; }
    `];V([R({type:String})],ot.prototype,"name",2);V([R({type:String})],ot.prototype,"emoji",2);V([R({type:String})],ot.prototype,"size",2);V([R({type:String})],ot.prototype,"bgColor",2);ot=V([fe("a2ui-avatar")],ot);var _f=Object.defineProperty,wf=Object.getOwnPropertyDescriptor,W=(e,t,n,i)=>{for(var o=i>1?void 0:i?wf(t,n):t,a=e.length-1,r;a>=0;a--)(r=e[a])&&(o=(i?r(t,n,o):r(o))||o);return i&&o&&_f(t,n,o),o};let Oe=class extends de{constructor(){super(...arguments),this.advisorName="AI経営コンサルタント",this.advisorEmoji="🤖",this.message="",this.category="general",this.sentiment="neutral",this.suggestions=[]}getCategoryInfo(){const e={finance:{emoji:"💰",label:"財務アドバイス"},hr:{emoji:"👥",label:"人事アドバイス"},market:{emoji:"📊",label:"市場分析"},product:{emoji:"📦",label:"製品戦略"},general:{emoji:"💡",label:"経営アドバイス"}};return e[this.category]||e.general}render(){const e=this.getCategoryInfo(),t=this.suggestions.length>0;return E`
      <div class="advisor-card sentiment-${this.sentiment}">
        <div class="advisor-header">
          <div class="advisor-avatar">${this.advisorEmoji}</div>
          <div class="advisor-info">
            <div class="advisor-name">${this.advisorName}</div>
            <div class="advisor-category">
              <span>${e.emoji}</span>
              <span>${e.label}</span>
            </div>
          </div>
        </div>

        <div class="message-content">
          ${this.message}
        </div>

        ${t?E`
          <div class="suggestions-section">
            <div class="suggestions-title">
              <span>💡</span>
              <span>おすすめアクション</span>
            </div>
            <div class="suggestion-list">
              ${this.suggestions.map(n=>E`
                <div class="suggestion-item">
                  <span class="suggestion-icon">→</span>
                  <span>${n}</span>
                </div>
              `)}
            </div>
          </div>
        `:F}
      </div>
    `}};Oe.styles=me`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .advisor-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
      position: relative;
      overflow: hidden;
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .advisor-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .advisor-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .advisor-avatar {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      backdrop-filter: blur(10px);
    }

    .advisor-info {
      flex: 1;
    }

    .advisor-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .advisor-category {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 12px;
    }

    .message-content {
      background: rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      backdrop-filter: blur(10px);
      line-height: 1.6;
    }

    .suggestions-section {
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 16px;
    }

    .suggestions-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestion-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .suggestion-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggestion-item:hover {
      background: rgba(255,255,255,0.2);
      transform: translateX(4px);
    }

    .suggestion-icon {
      font-size: 16px;
    }

    /* Sentiment indicators */
    .sentiment-positive { border-left: 4px solid #4CAF50; }
    .sentiment-neutral { border-left: 4px solid #2196F3; }
    .sentiment-warning { border-left: 4px solid #FF9800; }
    .sentiment-critical { border-left: 4px solid #F44336; }

    .expand-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .expand-btn:hover {
      background: rgba(255,255,255,0.2);
    }
  `;W([R({type:String})],Oe.prototype,"advisorName",2);W([R({type:String})],Oe.prototype,"advisorEmoji",2);W([R({type:String})],Oe.prototype,"message",2);W([R({type:String})],Oe.prototype,"category",2);W([R({type:String})],Oe.prototype,"sentiment",2);W([R({type:Array})],Oe.prototype,"suggestions",2);Oe=W([fe("a2ui-advisor-card")],Oe);let We=class extends de{constructor(){super(...arguments),this.headline="",this.content="",this.category="industry",this.impact="neutral",this.date=""}getCategoryInfo(){const e={economy:{emoji:"📈",label:"経済"},industry:{emoji:"🏭",label:"業界"},company:{emoji:"🏢",label:"企業"},tech:{emoji:"💻",label:"テクノロジー"},policy:{emoji:"📋",label:"政策"}};return e[this.category]||e.industry}getImpactInfo(){const e={positive:{emoji:"📈",label:"プラス影響"},negative:{emoji:"📉",label:"マイナス影響"},neutral:{emoji:"➖",label:"影響なし"}};return e[this.impact]||e.neutral}render(){const e=this.getCategoryInfo(),t=this.getImpactInfo();return E`
      <div class="news-card">
        <div class="news-header">
          <span class="category-badge category-${this.category}">
            <span>${e.emoji}</span>
            <span>${e.label}</span>
          </span>
          <span class="impact-indicator">${t.emoji}</span>
        </div>
        <div class="news-body">
          <div class="headline">${this.headline}</div>
          <div class="content">${this.content}</div>
        </div>
        <div class="news-footer">
          <span>${this.date||"最新ニュース"}</span>
          <span class="impact-label impact-${this.impact}">
            ${t.label}
          </span>
        </div>
      </div>
    `}};We.styles=me`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .news-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    .news-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .category-economy { background: #E3F2FD; color: #1565C0; }
    .category-industry { background: #F3E5F5; color: #7B1FA2; }
    .category-company { background: #E8F5E9; color: #2E7D32; }
    .category-tech { background: #FFF3E0; color: #E65100; }
    .category-policy { background: #ECEFF1; color: #455A64; }

    .impact-indicator {
      margin-left: auto;
      font-size: 20px;
    }

    .news-body {
      padding: 0 20px 20px;
    }

    .headline {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .content {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }

    .news-footer {
      padding: 12px 20px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #888;
    }

    .impact-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .impact-positive { color: #4CAF50; }
    .impact-negative { color: #F44336; }
    .impact-neutral { color: #9E9E9E; }
  `;W([R({type:String})],We.prototype,"headline",2);W([R({type:String})],We.prototype,"content",2);W([R({type:String})],We.prototype,"category",2);W([R({type:String})],We.prototype,"impact",2);W([R({type:String})],We.prototype,"date",2);We=W([fe("a2ui-news-card")],We);let Ae=class extends de{constructor(){super(...arguments),this.name="",this.position="",this.department="",this.personality="",this.motivation=100,this.skills={},this.certifications=[]}getMotivationClass(){return this.motivation>=70?"high":this.motivation>=40?"medium":"low"}getPersonalityEmoji(){return{すなお:"😊",まじめ:"📚",お調子者:"🎉",野心家:"🔥",協調的:"🤝"}[this.personality]||"👤"}render(){const e=this.name?this.name.charAt(0):"?",t=Object.entries(this.skills);return E`
      <div class="employee-card">
        <div class="employee-header">
          <div class="avatar">${e}</div>
          <div class="employee-info">
            <div class="employee-name">${this.name}</div>
            <div class="employee-meta">
              <span class="meta-item">👔 ${this.position}</span>
              <span class="meta-item">🏢 ${this.department}</span>
            </div>
            ${this.personality?E`
              <span class="personality-badge">
                ${this.getPersonalityEmoji()} ${this.personality}
              </span>
            `:F}
          </div>
        </div>

        <div class="motivation-section">
          <div class="motivation-label">
            <span>💪 モチベーション</span>
            <span>${this.motivation}%</span>
          </div>
          <div class="motivation-bar">
            <div class="motivation-fill motivation-${this.getMotivationClass()}"
                 style="width: ${this.motivation}%;"></div>
          </div>
        </div>

        ${t.length>0?E`
          <div class="skills-section">
            <div class="section-title">
              <span>📊</span>
              <span>スキル</span>
            </div>
            <div class="skills-grid">
              ${t.map(([n,i])=>E`
                <div class="skill-item">
                  <div class="skill-header">
                    <span class="skill-name">${n}</span>
                    <span class="skill-value">${i}</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" style="width: ${i}%;"></div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        `:F}

        ${this.certifications.length>0?E`
          <div class="certifications-section">
            <div class="section-title">
              <span>🎓</span>
              <span>資格</span>
            </div>
            <div class="cert-list">
              ${this.certifications.map(n=>E`
                <span class="cert-badge">✓ ${n}</span>
              `)}
            </div>
          </div>
        `:F}
      </div>
    `}};Ae.styles=me`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .employee-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }

    .employee-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }

    .employee-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .avatar {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: 600;
    }

    .employee-info {
      flex: 1;
    }

    .employee-name {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .employee-meta {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #666;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .motivation-section {
      margin-bottom: 20px;
    }

    .motivation-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .motivation-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .motivation-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .motivation-high { background: linear-gradient(90deg, #4CAF50, #8BC34A); }
    .motivation-medium { background: linear-gradient(90deg, #FF9800, #FFC107); }
    .motivation-low { background: linear-gradient(90deg, #F44336, #FF5722); }

    .skills-section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .skill-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .skill-name { color: #666; }
    .skill-value { color: #333; font-weight: 500; }

    .skill-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .skill-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 3px;
    }

    .certifications-section {
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .cert-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: #E8F5E9;
      color: #2E7D32;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .personality-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: #F3E5F5;
      color: #7B1FA2;
      border-radius: 12px;
      font-size: 11px;
    }
  `;W([R({type:String})],Ae.prototype,"name",2);W([R({type:String})],Ae.prototype,"position",2);W([R({type:String})],Ae.prototype,"department",2);W([R({type:String})],Ae.prototype,"personality",2);W([R({type:Number})],Ae.prototype,"motivation",2);W([R({type:Object})],Ae.prototype,"skills",2);W([R({type:Array})],Ae.prototype,"certifications",2);Ae=W([fe("a2ui-employee-card")],Ae);let Se=class extends de{constructor(){super(...arguments),this.title="",this.message="",this.eventType="info",this.icon="",this.autoClose=!0,this.duration=5e3,this.isVisible=!0,this.isClosing=!1}getDefaultIcon(){return{success:"✅",warning:"⚠️",danger:"🚨",info:"💡",achievement:"🏆"}[this.eventType]||"📢"}connectedCallback(){super.connectedCallback(),this.autoClose&&setTimeout(()=>this.close(),this.duration)}close(){this.isClosing=!0,setTimeout(()=>{this.isVisible=!1,this.dispatchEvent(new CustomEvent("close"))},300)}render(){return this.isVisible?E`
      <div class="notification type-${this.eventType} ${this.isClosing?"closing":""}">
        <div class="icon-container">${this.icon||this.getDefaultIcon()}</div>
        <div class="content">
          <div class="title">${this.title}</div>
          <div class="message">${this.message}</div>
        </div>
        <button class="close-btn" @click=${this.close}>×</button>
        ${this.autoClose?E`
          <div class="progress-bar" style="animation-duration: ${this.duration}ms;"></div>
        `:F}
      </div>
    `:F}};Se.styles=me`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .notification {
      position: relative;
      border-radius: 16px;
      padding: 20px 24px;
      color: white;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      animation: slideDown 0.4s ease-out;
      overflow: hidden;
    }

    .notification.closing {
      animation: slideUp 0.3s ease-in forwards;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideUp {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }

    .type-success { background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); }
    .type-warning { background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%); }
    .type-danger { background: linear-gradient(135deg, #F44336 0%, #FF5722 100%); }
    .type-info { background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%); }
    .type-achievement {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #333;
    }

    .notification::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%);
      pointer-events: none;
    }

    .icon-container {
      font-size: 32px;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .message {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      background: rgba(255,255,255,0.4);
      animation: progress linear forwards;
    }

    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;W([R({type:String})],Se.prototype,"title",2);W([R({type:String})],Se.prototype,"message",2);W([R({type:String})],Se.prototype,"eventType",2);W([R({type:String})],Se.prototype,"icon",2);W([R({type:Boolean})],Se.prototype,"autoClose",2);W([R({type:Number})],Se.prototype,"duration",2);W([Ka()],Se.prototype,"isVisible",2);W([Ka()],Se.prototype,"isClosing",2);Se=W([fe("a2ui-event-notification")],Se);let Ne=class extends de{constructor(){super(...arguments),this.revenue=0,this.expenses=0,this.profit=0,this.cash=0,this.debt=0,this.history=[]}formatMoney(e){return e>=1e8?`${(e/1e8).toFixed(1)}億円`:e>=1e4?`${Math.floor(e/1e4)}万円`:`${e.toLocaleString()}円`}render(){const e=this.profit>=0?"profit-positive":"profit-negative";return E`
      <div class="dashboard">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-label">手持ち資金</div>
            <div class="metric-value">${this.formatMoney(this.cash)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-label">売上高</div>
            <div class="metric-value">${this.formatMoney(this.revenue)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-label">営業利益</div>
            <div class="metric-value ${e}">${this.formatMoney(this.profit)}</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">🏦</div>
            <div class="metric-label">借入金</div>
            <div class="metric-value">${this.formatMoney(this.debt)}</div>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-title">
            <span>📋</span>
            <span>損益サマリー</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">売上高</span>
            <span class="summary-value">+${this.formatMoney(this.revenue)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">経費</span>
            <span class="summary-value">-${this.formatMoney(this.expenses)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">営業利益</span>
            <span class="summary-value">${this.profit>=0?"+":""}${this.formatMoney(this.profit)}</span>
          </div>
        </div>
      </div>
    `}};Ne.styles=me`
    :host {
      display: block;
      font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    }

    .dashboard {
      display: grid;
      gap: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .metric-icon {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .metric-change {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
    }

    .change-positive { background: #E8F5E9; color: #2E7D32; }
    .change-negative { background: #FFEBEE; color: #C62828; }

    .profit-positive { color: #4CAF50; }
    .profit-negative { color: #F44336; }

    .summary-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 24px;
      color: white;
    }

    .summary-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .summary-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .summary-label {
      opacity: 0.9;
    }

    .summary-value {
      font-weight: 600;
    }
  `;W([R({type:Number})],Ne.prototype,"revenue",2);W([R({type:Number})],Ne.prototype,"expenses",2);W([R({type:Number})],Ne.prototype,"profit",2);W([R({type:Number})],Ne.prototype,"cash",2);W([R({type:Number})],Ne.prototype,"debt",2);W([R({type:Array})],Ne.prototype,"history",2);Ne=W([fe("a2ui-finance-dashboard")],Ne);class mt{constructor(){this.notificationContainer=null,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>this.initContainers()):this.initContainers()}static getInstance(){return mt.instance||(mt.instance=new mt),mt.instance}initContainers(){if(!document.getElementById("a2ui-notifications")){const t=document.createElement("div");t.id="a2ui-notifications",t.style.cssText=`
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        pointer-events: none;
      `,document.body.appendChild(t),this.notificationContainer=t}}showAdvisor(t,n){const i=n?document.getElementById(n):this.getOrCreateAdvisorContainer();if(!i)return;const o=E`
      <a2ui-advisor-card
        category=${t.category}
        sentiment=${t.sentiment}
        message=${t.message}
        .suggestions=${t.suggestions||[]}
      ></a2ui-advisor-card>
    `;ae(o,i)}showNews(t,n){const i=n?document.getElementById(n):this.getOrCreateNewsContainer();if(!i)return;const o=E`
      <a2ui-news-card
        headline=${t.headline}
        content=${t.content}
        category=${t.category}
        impact=${t.impact}
        date=${t.date||""}
      ></a2ui-news-card>
    `;ae(o,i)}showNewsFeed(t,n){const i=document.getElementById(n);if(!i)return;const o=E`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${t.map(a=>E`
          <a2ui-news-card
            headline=${a.headline}
            content=${a.content}
            category=${a.category}
            impact=${a.impact}
            date=${a.date||""}
          ></a2ui-news-card>
        `)}
      </div>
    `;ae(o,i)}showEmployee(t,n){const i=document.getElementById(n);if(!i)return;const o=E`
      <a2ui-employee-card
        name=${t.name}
        position=${t.position}
        department=${t.department}
        personality=${t.personality||""}
        motivation=${t.motivation}
        .skills=${t.skills}
        .certifications=${t.certifications||[]}
      ></a2ui-employee-card>
    `;ae(o,i)}showEmployeeList(t,n){const i=document.getElementById(n);if(!i)return;const o=E`
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        ${t.map(a=>E`
          <a2ui-employee-card
            name=${a.name}
            position=${a.position}
            department=${a.department}
            personality=${a.personality||""}
            motivation=${a.motivation}
            .skills=${a.skills}
            .certifications=${a.certifications||[]}
          ></a2ui-employee-card>
        `)}
      </div>
    `;ae(o,i)}showNotification(t){this.initContainers();const n=document.createElement("div");n.style.pointerEvents="auto";const i=E`
      <a2ui-event-notification
        title=${t.title}
        message=${t.message}
        eventType=${t.eventType}
        icon=${t.icon||""}
        ?autoClose=${t.autoClose!==!1}
        duration=${t.duration||5e3}
        @close=${()=>n.remove()}
      ></a2ui-event-notification>
    `;ae(i,n),this.notificationContainer?.appendChild(n)}showFinanceDashboard(t,n){const i=document.getElementById(n);if(!i)return;const o=E`
      <a2ui-finance-dashboard
        revenue=${t.revenue}
        expenses=${t.expenses}
        profit=${t.profit}
        cash=${t.cash}
        debt=${t.debt}
      ></a2ui-finance-dashboard>
    `;ae(o,i)}notifySuccess(t,n){this.showNotification({title:t,message:n,eventType:"success"})}notifyWarning(t,n){this.showNotification({title:t,message:n,eventType:"warning"})}notifyDanger(t,n){this.showNotification({title:t,message:n,eventType:"danger"})}notifyInfo(t,n){this.showNotification({title:t,message:n,eventType:"info"})}notifyAchievement(t,n){this.showNotification({title:t,message:n,eventType:"achievement",duration:8e3})}generateAdvisorMessage(t){const n=t.revenue-t.expenses,i=t.revenue>0?n/t.revenue*100:0;return t.money<1e6?{category:"finance",sentiment:"critical",message:"資金が危険水準です！早急に対策が必要です。",suggestions:["銀行融資を検討する","不採算製品を整理する","コスト削減を実施する"]}:t.employees<3?{category:"hr",sentiment:"warning",message:"従業員が少なすぎます。成長のためには人材の確保が重要です。",suggestions:["採用活動を開始する","魅力的な給与体系を検討する","採用予算を増やす"]}:t.marketShare<5?{category:"market",sentiment:"neutral",message:"市場シェアの拡大が必要です。マーケティング戦略を見直しましょう。",suggestions:["マーケティング活動を強化する","新製品を開発する","ブランド力を高める"]}:i<10&&t.revenue>0?{category:"product",sentiment:"warning",message:`利益率が${i.toFixed(1)}%と低めです。製品戦略の見直しを検討してください。`,suggestions:["高付加価値製品を開発する","生産コストを見直す","価格戦略を再検討する"]}:n>0&&t.marketShare>10?{category:"general",sentiment:"positive",message:"経営状態は良好です！この調子で事業を拡大していきましょう。",suggestions:["新規市場への参入を検討する","優秀な人材を積極的に採用する","研究開発に投資する"]}:{category:"general",sentiment:"neutral",message:"現状を維持しつつ、成長の機会を探りましょう。",suggestions:["市場動向を注視する","従業員のスキルアップを図る","新製品のアイデアを検討する"]}}getOrCreateAdvisorContainer(){let t=document.getElementById("a2ui-advisor");return t||(t=document.createElement("div"),t.id="a2ui-advisor",t.style.cssText=`
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 9999;
        max-width: 400px;
      `,document.body.appendChild(t)),t}getOrCreateNewsContainer(){let t=document.getElementById("a2ui-news");return t||(t=document.createElement("div"),t.id="a2ui-news",document.body.appendChild(t)),t}clearAll(){this.notificationContainer?.replaceChildren(),document.getElementById("a2ui-advisor")?.replaceChildren(),document.getElementById("a2ui-news")?.replaceChildren()}}const $f=()=>mt.getInstance(),xf=$f();window.a2ui=xf;let ii="normal",oi="management";const Qa=`
    <div class="menu-screen">
        <div class="menu-header">
            <div class="menu-logo">🏢</div>
            <h1 class="menu-title">ビジネスエンパイア 2.0</h1>
            <p class="menu-subtitle">IT業界で成功を目指せ！</p>
        </div>

        <div class="menu-slots-container">
            <div class="menu-slot" id="menuSlot1" data-slot="1">
                <div class="slot-empty">
                    <div class="slot-icon">💾</div>
                    <div class="slot-label">スロット 1</div>
                    <div class="slot-action">+ 新しいゲーム</div>
                </div>
            </div>

            <div class="menu-slot" id="menuSlot2" data-slot="2">
                <div class="slot-empty">
                    <div class="slot-icon">💾</div>
                    <div class="slot-label">スロット 2</div>
                    <div class="slot-action">+ 新しいゲーム</div>
                </div>
            </div>

            <div class="menu-slot" id="menuSlot3" data-slot="3">
                <div class="slot-empty">
                    <div class="slot-icon">💾</div>
                    <div class="slot-label">スロット 3</div>
                    <div class="slot-action">+ 新しいゲーム</div>
                </div>
            </div>
        </div>

        <div class="menu-footer">
            <div class="menu-version">Version 2.0.0 Phase 2</div>
        </div>
    </div>

    <!-- フェーズ1: 難易度選択モーダル -->
    <div id="difficultyModal" class="difficulty-modal" style="display: none;">
        <div class="difficulty-modal-content">
            <h2 style="text-align: center; margin-bottom: 20px; color: #667eea;">🎮 難易度を選択</h2>
            <div class="difficulty-options">
                <div class="difficulty-option" data-difficulty="easy">
                    <div class="difficulty-emoji">😊</div>
                    <div class="difficulty-name">イージー</div>
                    <div class="difficulty-desc">初心者向け。資金2倍、競合は穏やか</div>
                    <div class="difficulty-money">💰 2,000万円</div>
                </div>
                <div class="difficulty-option selected" data-difficulty="normal">
                    <div class="difficulty-emoji">💼</div>
                    <div class="difficulty-name">ノーマル</div>
                    <div class="difficulty-desc">標準的な難易度。バランスの取れた挑戦</div>
                    <div class="difficulty-money">💰 1,000万円</div>
                </div>
                <div class="difficulty-option" data-difficulty="hard">
                    <div class="difficulty-emoji">🔥</div>
                    <div class="difficulty-name">ハード</div>
                    <div class="difficulty-desc">上級者向け。資金半分、競合は攻撃的</div>
                    <div class="difficulty-money">💰 500万円</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <button id="startWithDifficultyBtn" class="start-game-btn">ゲーム開始 🚀</button>
                <button id="cancelDifficultyBtn" class="cancel-btn" style="margin-left: 12px;">キャンセル</button>
            </div>
        </div>
    </div>

    <!-- モード選択モーダル -->
    <div id="modeSelectModal" class="difficulty-modal" style="display: none;">
        <div class="difficulty-modal-content">
            <h2 style="text-align: center; margin-bottom: 20px; color: #667eea;">🎮 ゲームモードを選択</h2>
            <div class="mode-selection" style="display: flex; gap: 16px; justify-content: center;">
                <div class="difficulty-option selected" data-mode="management" id="modeManagement" style="flex:1;max-width:220px;">
                    <div class="difficulty-emoji">📋</div>
                    <div class="difficulty-name">管理モード</div>
                    <div class="difficulty-desc">従来通り全てを直接操作</div>
                </div>
                <div class="difficulty-option" data-mode="ceo" id="modeCEO" style="flex:1;max-width:220px;">
                    <div class="difficulty-emoji">🏢</div>
                    <div class="difficulty-name">社長モード</div>
                    <div class="difficulty-desc">決裁書類と部下対応で経営</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <button id="confirmModeBtn" class="start-game-btn">次へ ➡️</button>
                <button id="cancelModeBtn" class="cancel-btn" style="margin-left: 12px;">キャンセル</button>
            </div>
        </div>
    </div>
`,kf=`
    <div class="container">
        <div class="header">
            <div class="company-name">🏢 株式会社スタートアップ</div>
            <div class="date" id="gameDate">2025年1月 第1週</div>
            <div class="stats">
                <div class="stat">
                    <div class="stat-label">💰 資金</div>
                    <div class="stat-value" id="money">1000万</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="moneyProgress" style="width: 100%"></div>
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-label">👥 従業員</div>
                    <div class="stat-value" id="employeeCount">1</div>
                </div>
                <div class="stat">
                    <div class="stat-label">📊 売上</div>
                    <div class="stat-value" id="revenue">0万</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="revenueProgress" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Phaser.js Game Canvas -->
        <div id="game-canvas" class="game-canvas-container"></div>

        <!-- ニュースティッカー -->
        <div class="news-ticker">
            <span id="newsText">📰 ゲーム開始！IT業界で成功を目指そう！</span>
        </div>

        <!-- ランキング表示 -->
        <div class="ranking-bar" id="rankingBar">
            <div class="rank-item">
                <span class="rank-medal">🥇</span>
                テックコープ<br>(35%)
            </div>
            <div class="rank-item">
                <span class="rank-medal">🥈</span>
                デジタルワークス<br>(29%)
            </div>
            <div class="rank-item">
                <span class="rank-medal">🥉</span>
                サイバーソフト<br>(22%)
            </div>
            <div class="rank-item player">
                <span class="rank-medal">4</span>
                あなた<br>(0.1%)
            </div>
        </div>

        <div class="tabs">
            <button class="tab active" data-panel="overview" onclick="showPanel(this, 'overview')">📊 概要</button>
            <button class="tab" data-panel="employees" onclick="showPanel(this, 'employees')">👥 人事</button>
            <button class="tab" data-panel="departments" onclick="showPanel(this, 'departments')">🏢 部署</button>
            <button class="tab" data-panel="products" onclick="showPanel(this, 'products')">📦 製品</button>
            <button class="tab" data-panel="market" onclick="showPanel(this, 'market')">📈 市場</button>
            <button class="tab" data-panel="finance" onclick="showPanel(this, 'finance')">💰 財務</button>
            <button class="tab" data-panel="certifications" onclick="showPanel(this, 'certifications')">🎓 資格</button>
            <button class="tab" data-panel="desk" onclick="showPanel(this, 'desk')" style="display:none;">🏢 社長室</button>
        </div>

        <div class="content">
            <div id="overview" class="panel active">
                <h3>🏢 会社概要</h3>
                <div class="info-box">
                    <div>
                        <span>業界</span>
                        <span>IT・ソフトウェア</span>
                    </div>
                    <div>
                        <span>市場シェア</span>
                        <span id="marketShare">0.1%</span>
                    </div>
                    <div>
                        <span>ブランド力</span>
                        <span id="brand">⭐</span>
                    </div>
                </div>

                <div id="officeDisplay"></div>

                <div id="achievementDisplay" class="achievement-panel"></div>

                <div class="chart-container">
                    <div class="chart-title">📈 売上推移</div>
                    <canvas id="revenueChart" height="180"></canvas>
                </div>

                <button id="endTurnBtn" class="btn" data-requires-active="true" onclick="nextTurn()">⏭️ 次のターンへ</button>
                <button class="btn" data-requires-active="true" onclick="saveGame()">💾 ゲーム保存</button>
                <button class="btn" onclick="returnToMenu()" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); color: #333;">🏠 メニューに戻る</button>
                <button class="btn" id="restartButton" onclick="restartGame()">🔄 ゲーム再スタート</button>
            </div>

            <div id="employees" class="panel">
                <h3>👥 従業員管理</h3>
                <div id="employeeList"></div>
                <button class="btn" data-requires-active="true" onclick="showHiring()">➕ 採用活動</button>
                <button class="btn" data-requires-active="true" onclick="trainEmployees()">📚 研修実施</button>
            </div>

            <div id="products" class="panel">
                <h3>📦 製品開発</h3>
                <div id="productList"></div>
                <button class="btn" data-requires-active="true" onclick="developProduct()">🔧 新製品開発</button>
            </div>

            <div id="market" class="panel">
                <h3>🏢 市場状況</h3>
                <div class="chart-container">
                    <div class="chart-title">📊 市場シェア分布</div>
                    <canvas id="marketChart" height="200"></canvas>
                </div>
                <div id="marketInfo"></div>
                <button class="btn" data-requires-active="true" onclick="doMarketing()">📢 マーケティング</button>
            </div>

            <div id="finance" class="panel">
                <h3>💰 財務状況</h3>
                <div id="financeInfo"></div>
                <button class="btn" data-requires-active="true" onclick="getLoan()">🏦 銀行融資</button>
                <button class="btn" data-requires-active="true" onclick="repayLoan()">💸 融資返済</button>
            </div>

            <div id="departments" class="panel">
                <h3>🏢 部署管理</h3>
                <div style="margin-bottom: 20px; padding: 14px; background: rgba(102, 126, 234, 0.1); border-radius: 12px;">
                    <div style="font-size: 13px; color: #666;">
                        📊 各部署の状況を確認し、効率的な人員配置を行いましょう
                    </div>
                </div>
                <div id="departmentsGrid"></div>
            </div>

            <div id="desk" class="panel"></div>

            <div id="certifications" class="panel">
                <div id="certificationPanel">
                    <div class="certification-empty-state">
                        <div class="empty-icon">🎓</div>
                        <h3>資格取得システム</h3>
                        <p>従業員のスキルアップのために資格取得を支援しましょう。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="modal" class="modal" onclick="if(event.target===this)closeModal()">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="modalTitle"></div>
                <button class="modal-close-x" onclick="closeModal()" aria-label="閉じる">&times;</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer">
                <button class="modal-close" onclick="closeModal()">閉じる</button>
            </div>
        </div>
    </div>
`;async function Mi(e,t="normal"){const n=document.querySelector("#app");n&&(n.innerHTML=kf,typeof window.initWithSlot=="function"&&(await window.initWithSlot(e,t),typeof window.initAnimationSystem=="function"&&window.initAnimationSystem()))}async function Cf(){const e=document.querySelector("#app");e&&(document.getElementById("tutorialOverlay")?.remove(),e.innerHTML=Qa,await Ja())}let zt=null;function Sf(e){zt=e,ii="normal",oi="management";const t=document.getElementById("modeSelectModal");if(t){t.style.display="flex";const n=t.querySelectorAll(".difficulty-option[data-mode]");n.forEach(a=>{a.classList.remove("selected"),a.dataset.mode==="management"&&a.classList.add("selected"),a.addEventListener("click",()=>{n.forEach(r=>r.classList.remove("selected")),a.classList.add("selected"),oi=a.dataset.mode})});const i=document.getElementById("confirmModeBtn");i&&(i.onclick=()=>{t.style.display="none",Tf()});const o=document.getElementById("cancelModeBtn");o&&(o.onclick=()=>{t.style.display="none",zt=null})}}function Tf(){const e=document.getElementById("difficultyModal");if(e){e.style.display="flex";const t=e.querySelectorAll(".difficulty-option[data-difficulty]");t.forEach(o=>{o.classList.remove("selected"),o.dataset.difficulty==="normal"&&o.classList.add("selected"),o.addEventListener("click",()=>{t.forEach(a=>a.classList.remove("selected")),o.classList.add("selected"),ii=o.dataset.difficulty})});const n=document.getElementById("startWithDifficultyBtn");n&&(n.onclick=async()=>{if(e.style.display="none",zt!==null&&(await Mi(zt,ii),oi==="ceo")){typeof window.game<"u"&&(window.game.gameMode="ceo",window.game.tutorialCompleted=!0),document.getElementById("tutorialOverlay")?.remove();const o=document.getElementById("modal");if(o){const a=document.getElementById("modalTitle"),r=document.getElementById("modalBody");a&&(a.textContent="🏢 CEO特性を選択"),r&&(r.innerHTML=Ef()),o.classList.add("active")}}});const i=document.getElementById("cancelDifficultyBtn");i&&(i.onclick=()=>{e.style.display="none",zt=null})}}function Ef(){return`
    <div class="ceo-trait-selection">
      <p style="text-align:center;color:#666;font-size:13px;margin-bottom:20px;">選んだ特性がゲーム全体に影響します</p>
      <div class="trait-grid">
        ${[{key:"visionary",emoji:"🔮",name:"先見の明",desc:"市場の変化を敏感に察知。長期投資のヒントが見やすい"},{key:"people_person",emoji:"🤝",name:"人たらし",desc:"人心掌握に長ける。訪問者対応の効果が+50%"},{key:"analyst",emoji:"📊",name:"分析家",desc:"数字に強い。数値不整合の観察ポイントが追加される"},{key:"charismatic",emoji:"🌟",name:"カリスマ",desc:"圧倒的なカリスマ性。支持率の自然減衰が軽減"},{key:"strict",emoji:"⚔️",name:"厳格",desc:"規律を重んじる。罠の発見率+20%、却下時のモチベ影響大"},{key:"generous",emoji:"🎁",name:"寛大",desc:"部下に寛容。承認ボーナスが大きいが罠の発見が難しい"}].map(t=>`
          <div class="trait-option" onclick="selectCEOTrait('${t.key}')">
            <div class="trait-emoji">${t.emoji}</div>
            <div class="trait-name">${t.name}</div>
            <div class="trait-desc">${t.desc}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `}async function ai(e){await Nu(e)?await Mi(e):Sf(e)}function Af(e){const t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0"),o=String(e.getHours()).padStart(2,"0"),a=String(e.getMinutes()).padStart(2,"0");return`${t}/${n}/${i} ${o}:${a}`}async function Ja(){try{const e=await hi();for(let t=1;t<=3;t++){const n=document.getElementById(`menuSlot${t}`);if(!n)continue;const i=e[t];if(i){const o=Math.floor(i.playTime/3600),a=Math.floor(i.playTime%3600/60),r=o>0?`${o}時間${a}分`:`${a}分`,c=new Date(i.lastSaveDate),d=Af(c),u="⭐".repeat(Math.min(i.brandLevel,5)),v=document.createElement("div");v.className="slot-filled";const f=document.createElement("div");f.className="slot-company-name",f.textContent=`🏢 ${i.companyName}`,v.appendChild(f);const y=document.createElement("div");y.className="slot-metadata",[{label:"プレイ時間",value:`⏱️ ${r}`},{label:"最終保存",value:`💾 ${d}`},{label:"ゲーム内日付",value:`📅 ${i.gameDate.year}年${i.gameDate.month}月 第${i.gameDate.week}週`},{label:"資金",value:`💰 ${Math.floor(i.money/1e4)}万円`},{label:"従業員数",value:`👥 ${i.employeeCount}人`},{label:"市場シェア",value:`📊 ${i.marketShare}%`}].forEach(L=>{const A=document.createElement("div");A.className="slot-meta-item";const D=document.createElement("div");D.className="slot-meta-label",D.textContent=L.label;const O=document.createElement("div");O.className="slot-meta-value",O.textContent=L.value,A.appendChild(D),A.appendChild(O),y.appendChild(A)}),v.appendChild(y);const T=document.createElement("div");T.style.textAlign="center",T.style.marginTop="8px",T.style.fontSize="18px",T.textContent=u||"(スタート)",v.appendChild(T),n.innerHTML="",n.appendChild(v)}n.style.cursor="pointer",n.addEventListener("click",()=>{ai(t)})}}catch{for(let t=1;t<=3;t++){const n=document.getElementById(`menuSlot${t}`);n&&(n.style.cursor="pointer",n.addEventListener("click",()=>{ai(t)}))}}}window.startGameWithSlot=Mi;window.onSlotClick=ai;window.returnToMenu=Cf;document.addEventListener("DOMContentLoaded",async()=>{const e=document.querySelector("#app");e&&(e.innerHTML=Qa,await Ja())});
//# sourceMappingURL=index-BJsQG_VZ.js.map
