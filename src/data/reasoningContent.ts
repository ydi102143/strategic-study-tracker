export interface ReasoningItem {
    id: string;
    category: string;
    title: string;
    description: string;
    scene: string;
}

export const REASONING_DATA: ReasoningItem[] = [
    // --- 1. 線形代数 (ユーザー提供 + 補強) ---
    {
        id: 'la_1',
        category: 'Linear Algebra',
        title: '空間の基礎構造 (ベクトル空間, 部分空間, 線形独立)',
        description: 'エージェントの状態や戦略をベクトル空間の点として表現する基礎。',
        scene: 'ゲーム理論における混合戦略は、純粋戦略ベクトル $v_i$ の線形結合 $p = \\sum c_i v_i$ として表されます。'
    },
    {
        id: 'la_2',
        category: 'Linear Algebra',
        title: '次元と基底変換',
        description: '複雑なデータを「扱いやすい基底」に変換し、情報の圧縮や抽象化を行う。',
        scene: 'ディープラーニングの隠れ層は、入力をより抽象的な潜在空間の基底 $x\' = P^{-1}x$ へと変換する過程です。'
    },
    {
        id: 'la_3',
        category: 'Linear Algebra',
        title: '線形写像と合成',
        description: '層を重ねることで複雑な変換を行うニューラルネットワークの本質。',
        scene: 'NNの各層は線形写像 $W$ と非線形関数 $\\sigma$ の合成 $h = \\sigma(Wx + b)$ として定義されます。'
    },
    {
        id: 'la_4',
        category: 'Linear Algebra',
        title: 'Kernel (核) と Range (値域)',
        description: '「行動が環境に影響を与えない操作」や「表現可能な空間」の特定。',
        scene: '$\\ker(A)$ は無駄な行動空間の削減に、$\\text{rank}(A)$ はゲームの利得行列が持つ真の複雑さを表します。'
    },
    {
        id: 'la_5',
        category: 'Linear Algebra',
        title: '次元定理 (Rank–Nullity 定理)',
        description: '入力情報の「残る部分」と「失われる部分（不変性）」のバランス解析。',
        scene: '$\\dim(\\ker A) + \\text{rank}(A) = n$ により、ボトルネック層を通過する情報の割合を理論的に把握します。'
    },
    {
        id: 'la_6',
        category: 'Linear Algebra',
        title: '行列積と期待利得',
        description: '複数エージェント間の相互作用を美しく記述する数学的表現。',
        scene: '2人ゲームの期待利得 $u_1 = x^T A y$ や、強化学習のレゾルベント行列 $(I - \\gamma P)^{-1}$ で多用されます。'
    },
    {
        id: 'la_7',
        category: 'Linear Algebra',
        title: '内積空間とノルム',
        description: 'ベクトルの類似度測定や、過学習を防ぐためのペナルティ。',
        scene: 'コサイン類似度による類似戦略の検索や、L2正則化 $\|w\|^2$ によるモデルの複雑さ抑制に使用されます。'
    },
    {
        id: 'la_8',
        category: 'Linear Algebra',
        title: '固有理論 (固有値・固有ベクトル)',
        description: 'システムの長期的な挙動や定常状態の解析。',
        scene: 'マルコフ連鎖の推移確率行列 $P$ において、固有値1の固有ベクトル $\\pi^T P = \\pi^T$ は定常分布を表します。'
    },
    {
        id: 'la_9',
        category: 'Linear Algebra',
        title: '特異値分解 (SVD)',
        description: '巨大なデータ行列から最も重要な特徴を抽出する強力な手法。',
        scene: '不完全情報ゲームにおける戦略空間の圧縮や、レコメンドシステムでの潜在因子抽出に必須です。'
    },
    {
        id: 'la_10',
        category: 'Linear Algebra',
        title: 'テンソル積 (クロネッカー積)',
        description: '独立したシステムを統合して巨大な結合空間を構築する演算。',
        scene: '量子機械学習でのマルチ量子ビット系や、エージェント間の同時確率空間の構築に用いられます。'
    },

    // --- 2. 微分積分 & 最適化 (ユーザー提供 + 新規) ---
    {
        id: 'opt_1',
        category: 'Optimization',
        title: '勾配 (Gradient) と 方策勾配',
        description: '関数が最も急激に増加する方向を特定し、行動を改善する。',
        scene: '強化学習の Policy Gradient 法では、期待報酬の勾配 $\\nabla_\\theta J(\\theta)$ 方向へ方策を更新します。'
    },
    {
        id: 'opt_2',
        category: 'Optimization',
        title: 'ヘッセ行列 (Hessian)',
        description: '空間の曲率（歪み）を解析し、最適化の安定性を向上させる。',
        scene: '二階微分の正定値性により、現在の点が局所的最小値か鞍点かを判定し、学習を高速化します。'
    },
    {
        id: 'opt_3',
        category: 'Optimization',
        title: 'ラグランジュの未定乗数法',
        description: '制約条件付きの最適化問題を解くための強力なフレームワーク。',
        scene: '「予算内で利得を最大化する」などの制約付き戦略立案や、SVMの双対問題の導出に現れます。'
    },
    {
        id: 'opt_4',
        category: 'Optimization',
        title: 'テイラー展開と近接最適化',
        description: '複雑な関数を局所的に多項式で近似し、安全なステップサイズを決定する。',
        scene: 'PPOやTRPOといった強化学習アルゴリズムにおいて、方策が崩壊しない信頼領域を計算する基礎です。'
    },

    // --- 3. 確率・統計 (ユーザー提供 + 新規) ---
    {
        id: 'prob_1',
        category: 'Probability',
        title: 'ベイズの定理と信念更新',
        description: '不確実な観測から、相手の隠された状態を逐次的に推定する。',
        scene: 'ポーカーAI等が相手のベッティング行動を見て「相手が強い手を持っている確率」を更新する核となります。'
    },
    {
        id: 'prob_2',
        category: 'Probability',
        title: 'マルコフ決定過程 (MDP)',
        description: '未来の状態が現在のみに依存する環境での意思決定モデル。',
        scene: '現代の強化学習理論の絶対的な土台であり、エージェントと環境の相互作用を定式化します。'
    },
    {
        id: 'prob_3',
        category: 'Probability',
        title: 'モンテカルロ推定 & MCTS',
        description: '解析不能な期待値を、大量のランダムシミュレーション（サンプル）で近似する。',
        scene: 'AlphaGoの中核技術であるモンテカルロ木探索は、無数の「空想」から最適な一手を選び出します。'
    },

    // --- 4. 情報理論 (新規) ---
    {
        id: 'info_1',
        category: 'Information Theory',
        title: 'エントロピー (Entropy)',
        description: '情報が持つ不確実性や「驚き」の度合いを定量化する。',
        scene: 'RLでの「最大エントロピー強化学習」では、期待報酬だけでなく探索の多様性を残すために使用されます。'
    },
    {
        id: 'info_2',
        category: 'Information Theory',
        title: 'KL ダイバージェンス',
        description: '2つの確率分布がどれくらい「異なっているか」を測る非対称な距離。',
        scene: 'VAE（変分オートエンコーダ）において、潜在変数の分布を正規分布に近づけるための正則化項として機能します。'
    },
    {
        id: 'info_3',
        category: 'Information Theory',
        title: '相互情報量 (Mutual Information)',
        description: 'ある変数を知ることで、別の変数についてどれだけの情報を得られるか。',
        scene: '特徴選択や、情報の表現学習における「情報ボトルネック理論」の核心的な指標です。'
    },

    // --- 5. 数値解析 & グラフ理論 (新規) ---
    {
        id: 'num_1',
        category: 'Numerical Analysis',
        title: '数値的安定性とオーバーフロー',
        description: 'コンピュータ上の有限精度で、巨大な値を計算しても壊れない手法。',
        scene: 'Softmax計算時の Log-Sum-Exp トリックなどは、微小な確率がゼロに消えるのを防ぐ必須技術です。'
    },
    {
        id: 'graph_1',
        category: 'Graph Theory',
        title: 'グラフラプラシアン',
        description: 'ネットワーク上の情報の流れや、構造の滑らかさを記述する行列。',
        scene: 'マルチエージェント系での「合意形成」の速さや、グラフニューラルネットワークでの特徴伝播を支配します。'
    },

    // --- 6. 幾何・トポロジー (新規) ---
    {
        id: 'geo_1',
        category: 'Geometry',
        title: '多様体仮説 (Manifold Hypothesis)',
        description: '高次元データは、実は低次元の滑らかな曲面に沿って分布しているという仮説。',
        scene: '高次元の画像を、少数のパラメータ（潜在空間）で記述できる根拠となり、生成AIの成功を支えています。'
    }
];
