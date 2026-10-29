# ============================================================================
# JTEST4U_PACK1_GRAMMAR — Sets 1-3 (150 questions, sequential extraction)
# Source: Exercises Grammar.txt (EX-1 through EX-15)
# Compile: python compile_dsl.py JTEST4U_PACK1_GRAMMAR_a.dsl --build --no-shuffle
# ============================================================================

@pack JTEST4U_PACK1_GRAMMAR

# ============================================================================
# SET 1 — Questions 1-50 (EX-1 Q1-10, EX-2 Q1-10, EX-3 Q1-10, EX-4 Q1-10, EX-5 Q1-10)
# ============================================================================
@set set-grammar-seq-01 | N5 Grammar Set 1: Questions 1-50 | grammar | n5,grammar,sequential,beginner
@ctx まいにちしんぶん　_______ 読みます。 | 
@ctx 田中さんは　_______ 来ていませんよ。 | 
@ctx ナイフ　_______ パンをきりました。 | 
@ctx 家にかえってねたほう　_______ いいですよ。 | 
@ctx お母さん、もうあそびに　_______ もいいですか？ | 
@ctx すいようびには日本語のテスト　_______ 。 | 
@ctx あなたのかみは　_______ よ。 | 
@ctx わたしはけいかんに　_______ です。 | 
@ctx わたしは、これから　_______ に行きます。 | 
@ctx あの人たちはどこに行っているん　_______ 。 | 
@ctx この本は　_______ 読みました。 | 
@ctx 山田さんはたいへんいい人ですよ。なにもわるいことはきいたことが　_______ わ。 | 
@ctx ここにじゅうしょを書いて　_______ か？ | 
@ctx あなたはあそこへ行って　_______ いけませんよ。 | 
@ctx どれ　_______ ここではたらいていましたか？ | 
@ctx わたしはおんがくをきく　_______ 好きです。 | 
@ctx わたしは一人でクリスマスをすごす　_______ です。 | 
@ctx _______ ながら水を飲まないでください。 | 
@ctx れいぞうこにビールが入っている　_______ 、そこにすわって飲みましょう。 | 
@ctx わたしのことをいつまでも　_______ ください。 | 
@ctx まっすぐベッドに行きなさい。明日は　_______ なりますよ。 | 
@ctx とうきょうにかえる　_______ 、もういちどあなたに会いたいです。 | 
@ctx もうすこし　_______ してくださいませんか。 | 
@ctx わたしは、あなたに　_______ にここに来ました。 | 
@ctx そんなにしんぱい　_______ な。彼はぜったい大丈夫だ。 | 
@ctx わたしたちはもうあの家にすんで　_______ 。 | 
@ctx それ、母には　_______ ほうがいいですよ。 | 
@ctx こどもたちが先生のまわりに　_______ います。 | 
@ctx 兄はたにんにものを教える　_______ 上手なんです。 | 
@ctx かのじょのへやはあまりきれい　_______ 。 | 
@ctx わたしはここにいちど　_______ 来たことがあります。 | 
@ctx アキラ　_______ わたし　_______ あなたのともだちなんですよ。 | 
@ctx 母はとなりのおくさんと少し話を　_______ から家にかえっていった。 | 
@ctx 家にいるよりここ　_______ ほうがきけんですよ。 | 
@ctx わたしがあなた　_______ ならんで立ってもいいですか？ | 
@ctx コーヒーでも飲みながら　_______ 。 | 
@ctx みなさん、なぜここにあつまったか、わかっている　_______ 。 | 
@ctx わたしの学校にはたくさんの学生が　_______ 。 | 
@ctx このじしょはここ　_______ つかってください。 | 
@ctx なにか　_______ ことがありますか？ | 
@ctx これ　_______ ちずです。 | 
@ctx スーパー　_______ かいものをしました。 | 
@ctx 犬が２ひきいます。ねこ　_______ ２ひきいます。 | 
@ctx らいげつおきなわへりょこう　_______ 行きます。 | 
@ctx ぼくはまいにち中国語　_______ べんきょうします。 | 
@ctx らいしゅうもひとりで来ますか？いいえ、らいしゅうはともだち　_______ 来ます。 | 
@ctx 「どういたしまして」はえいご　_______ なんといいますか？ | 
@ctx ここにじゅうしょ　_______ せいねんがっぴをかいてください。 | 
@ctx わたしはいつもうちからがっこう　_______ くるまで行きます。 | 
@ctx このバスはゆうびんきょくのまえ　_______ とおります。 | 

q まいにちしんぶん　_______ 読みます。 | を[object marker] | へ[to (direction)] | に[to/at] | が[subject marker] | 0
q 田中さんは　_______ 来ていませんよ。 | まだ[still/yet] | もう[already] | だけ[only] | まで[until] | 1
q ナイフ　_______ パンをきりました。 | で[with/by (means)] | を[object marker] | に[to/at] | が[subject marker] | 2
q 家にかえってねたほう　_______ いいですよ。 | が[subject marker] | と[and/with] | に[to/at] | は[topic marker] | 3
q お母さん、もうあそびに　_______ もいいですか？ | 行って[to go (te-form)] | 行く[to go (dict.)] | 行った[went (past)] | 行っている[is going] | 4
q すいようびには日本語のテスト　_______ 。 | があります[is (inanimate)] | はいます[is (animate)] | はあります[is (inanimate)] | がいます[is (animate)] | 5
q あなたのかみは　_______ よ。 | 長すぎます[too long] | 長ってすぎます[incorrect form] | 長くすぎます[incorrect form] | 長いすぎます[incorrect form] | 6
q わたしはけいかんに　_______ です。 | なりたい[want to become] | したい[want to do] | いきたい[want to go] | いたい[hurts] | 7
q わたしは、これから　_______ に行きます。 | およぎ[swimming (stem)] | およぐ[to swim (dict.)] | およいで[to swim (te-form)] | およいだ[swam (past)] | 8
q あの人たちはどこに行っているん　_______ 。 | だろう[I wonder] | つもりだ[intend to] | から[because] | けれども[but] | 9
q この本は　_______ 読みました。 | もう[already] | どう[how] | も[also] | まだ[not yet] | 10
q 山田さんはたいへんいい人ですよ。なにもわるいことはきいたことが　_______ わ。 | ありません[does not exist] | しません[does not do] | いません[is not (animate)] | なりません[does not become] | 11
q ここにじゅうしょを書いて　_______ か？ | くださいません[would you please (neg.)] | ください[please (do)] | くださいます[will give (polite)] | くださいましょうか[shall I please] | 12
q あなたはあそこへ行って　_______ いけませんよ。 | は[topic marker] | が[subject marker] | と[and/with] | に[to/at] | 13
q どれ　_______ ここではたらいていましたか？ | くらい[about/approximately] | まで[until] | もう[already] | より[than] | 14
q わたしはおんがくをきく　_______ 好きです。 | のが[nominalizer + subject] | ので[because] | のに[although] | のは[nominalizer + topic] | 15
q わたしは一人でクリスマスをすごす　_______ です。 | つもり[intend to] | たい[want to] | だろう[probably] | ほう[side/way] | 16
q _______ ながら水を飲まないでください。 | あるき[walking (stem)] | あるく[to walk (dict.)] | あるいて[to walk (te-form)] | あるかな[I wonder if walk] | 17
q れいぞうこにビールが入っている　_______ 、そこにすわって飲みましょう。 | から[because] | と[and/with] | なら[if] | たら[when/if] | 18
q わたしのことをいつまでも　_______ ください。 | わすれないで[please don't forget] | わすれない[not forget (plain)] | わすれないて[incorrect form] | わすれなくて[not forgetting (te-form)] | 19
q まっすぐベッドに行きなさい。明日は　_______ なりますよ。 | いそがしく[busy (adverbial)] | いそがしいに[incorrect form] | いそがしい[busy (plain)] | いそがしくて[busy and (te-form)] | 20
q とうきょうにかえる　_______ 、もういちどあなたに会いたいです。 | まえに[before (time)] | まえ[before] | まえで[before (location)] | まえには[before (topic)] | 21
q もうすこし　_______ してくださいませんか。 | しずかに[quietly] | しずかだ[quiet (plain)] | しずか[quiet (stem)] | しずかで[quiet and (te-form)] | 22
q わたしは、あなたに　_______ にここに来ました。 | 会い[meeting (stem)] | 会う[to meet (dict.)] | 会って[to meet (te-form)] | 会います[to meet (polite)] | 23
q そんなにしんぱい　_______ な。彼はぜったい大丈夫だ。 | する[do (dict.)] | し[do (stem)] | した[did (past)] | している[is doing] | 24
q わたしたちはもうあの家にすんで　_______ 。 | いません[is not (polite neg.)] | あります[exists (polite)] | いました[was (past)] | います[is (polite)] | 25
q それ、母には　_______ ほうがいいですよ。 | 言わない[not say (plain)] | 言うな[don't say (imperative)] | 言わないで[not say (te-form)] | 言わなくて[not saying (te-form)] | 26
q こどもたちが先生のまわりに　_______ います。 | すわって[sitting (te-form)] | すわり[sit (stem)] | すわる[to sit (dict.)] | すわった[sat (past)] | 27
q 兄はたにんにものを教える　_______ 上手なんです。 | のが[nominalizer + subject] | のは[nominalizer + topic] | ので[because] | のに[although] | 28
q かのじょのへやはあまりきれい　_______ 。 | じゃありません[is not (polite neg.)] | いません[is not (animate)] | じゃいません[incorrect form] | ありません[does not exist] | 29
q わたしはここにいちど　_______ 来たことがあります。 | だけ[only] | もう[already] | まだ[not yet] | まえ[before] | 30
q アキラ　_______ わたし　_______ あなたのともだちなんですよ。 | も/も[both/and] | は/は[topic/topic] | や/や[and/and] | と/と[with/with] | 31
q 母はとなりのおくさんと少し話を　_______ から家にかえっていった。 | して[do (te-form)] | し[do (stem)] | する[do (dict.)] | した[did (past)] | 32
q 家にいるよりここ　_______ ほうがきけんですよ。 | の[possessive] | を[object marker] | な[attributive] | に[to/at] | 33
q わたしがあなた　_______ ならんで立ってもいいですか？ | と[with] | で[by means] | を[object marker] | に[to/at] | 34
q コーヒーでも飲みながら　_______ 。 | 話しましょう[let's talk] | 話します[will talk] | 話しません[will not talk] | 話しましよう[incorrect form] | 35
q みなさん、なぜここにあつまったか、わかっている　_______ 。 | でしょう[probably/right?] | でした[was (past)] | でしました[incorrect form] | でしましょう[incorrect form] | 36
q わたしの学校にはたくさんの学生が　_______ 。 | います[is (animate)] | いっています[is going] | あります[exists (inanimate)] | あっています[is matching] | 37
q このじしょはここ　_______ つかってください。 | で[at/by means] | に[to/at] | の[possessive] | を[object marker] | 38
q なにか　_______ ことがありますか？ | 言いたい[want to say] | 言たい[incorrect form] | 言うたい[incorrect form] | 言ってたい[incorrect form] | 39
q これ　_______ ちずです。 | は[topic marker] | に[to/at] | を[object marker] | や[and] | 40
q スーパー　_______ かいものをしました。 | で[at (location of action)] | か[question particle] | に[to/at] | へ[to direction] | 41
q 犬が２ひきいます。ねこ　_______ ２ひきいます。 | も[also] | や[and] | で[by means] | に[to/at] | 42
q らいげつおきなわへりょこう　_______ 行きます。 | に[purpose marker] | と[with] | が[subject marker] | を[object marker] | 43
q ぼくはまいにち中国語　_______ べんきょうします。 | を[object marker] | と[with] | の[possessive] | や[and] | 44
q らいしゅうもひとりで来ますか？いいえ、らいしゅうはともだち　_______ 来ます。 | と[with] | は[topic marker] | へ[to direction] | が[subject marker] | 45
q 「どういたしまして」はえいご　_______ なんといいますか？ | で[in (language)] | が[subject marker] | を[object marker] | に[to/at] | 46
q ここにじゅうしょ　_______ せいねんがっぴをかいてください。 | と[and] | で[by means] | を[object marker] | も[also] | 47
q わたしはいつもうちからがっこう　_______ くるまで行きます。 | まで[until/to] | しか[only] | ごろ[around] | で[by means] | 48
q このバスはゆうびんきょくのまえ　_______ とおります。 | を[through/past] | で[by means] | に[to/at] | へ[to direction] | 49

v 毎日 | まいにち | mainichi | every day | noun,time,n5
v 新聞 | しんぶん | shinbun | newspaper | noun,n5
v 読む | よむ | yomu | to read | verb,godan-verb,transitive,n5
v 田中 | たなか | tanaka | Tanaka (surname) | noun,n5
v 来る | くる | kuru | to come | verb,kuru-verb,intransitive,n5
v ナイフ | ナイフ | naifu | knife | noun,katakana,n5
v パン | パン | pan | bread | noun,food,katakana,n5
v 切る | きる | kiru | to cut | verb,godan-verb,transitive,n5
v 家 | いえ | ie | house | noun,place,house,n5
v 帰る | かえる | kaeru | to return home | verb,godan-verb,intransitive,n5
v 寝る | ねる | neru | to sleep | verb,ichidan-verb,intransitive,n5
v お母さん | おかあさん | okaasan | mother | noun,family,n5
v 遊ぶ | あそぶ | asobu | to play | verb,godan-verb,intransitive,n5
v 水曜日 | すいようび | suiyoubi | Wednesday | noun,days-of-week,time,n5
v 日本語 | にほんご | nihongo | Japanese language | noun,school,n5
v テスト | テスト | tesuto | test | noun,school,katakana,n5
v 髪 | かみ | kami | hair | noun,body-part,n5
v 長い | ながい | nagai | long | i-adjective,n5
v 警官 | けいかん | keikan | police officer | noun,work,n4
v 泳ぐ | およぐ | oyogu | to swim | verb,godan-verb,intransitive,n5
v 人たち | ひとたち | hitotachi | people | noun,n5
v 行く | いく | iku | to go | verb,godan-verb,intransitive,n5
v 本 | ほん | hon | book | noun,n5
v もう | もう | mou | already | adverb,n5
v まだ | まだ | mada | still/not yet | adverb,n5
v 山田 | やまだ | yamada | Yamada (surname) | noun,n5
v たいへん | たいへん | taihen | very | adverb,n5
v いい | いい | ii | good | i-adjective,n5
v 人 | ひと | hito | person | noun,n5
v 悪い | わるい | warui | bad | i-adjective,n5
v 聞く | きく | kiku | to hear/listen | verb,godan-verb,transitive,n5
v 住所 | じゅうしょ | juusho | address | noun,n5
v 書く | かく | kaku | to write | verb,godan-verb,transitive,n5
v あそこ | あそこ | asoko | over there | pronoun,place,n5
v 働く | はたらく | hataraku | to work | verb,godan-verb,intransitive,n5
v 音楽 | おんがく | ongaku | music | noun,hobby,n5
v 好き | すき | suki | like | na-adjective,emotion,n5
v 一人で | ひとりで | hitori de | alone | adverb,n5
v クリスマス | クリスマス | kurisumasu | Christmas | noun,katakana,n5
v 過ごす | すごす | sugosu | to spend (time) | verb,godan-verb,transitive,n4
v 歩く | あるく | aruku | to walk | verb,godan-verb,intransitive,n5
v 水 | みず | mizu | water | noun,drink,n5
v 飲む | のむ | nomu | to drink | verb,godan-verb,transitive,n5
v 冷蔵庫 | れいぞうこ | reizouko | refrigerator | noun,house,furniture,n5
v ビール | ビール | biiru | beer | noun,drink,katakana,n5
v 入る | はいる | hairu | to enter/contain | verb,godan-verb,intransitive,n5
v 座る | すわる | suwaru | to sit | verb,godan-verb,intransitive,n5
v いつまでも | いつまでも | itsumademo | forever | adverb,n4
v 忘れる | わすれる | wasureru | to forget | verb,ichidan-verb,transitive,n5
v まっすぐ | まっすぐ | massugu | straight | adverb,n5
v ベッド | ベッド | beddo | bed | noun,furniture,katakana,n5
v 明日 | あした | ashita | tomorrow | noun,time,n5
v 忙しい | いそがしい | isogashii | busy | i-adjective,n5
v もう一度 | もういちど | mou ichido | once more | expression,n5
v 会う | あう | au | to meet | verb,godan-verb,intransitive,n5
v もう少し | もうすこし | mou sukoshi | a bit more | expression,n5
v 静か | しずか | shizuka | quiet | na-adjective,n5
v 心配 | しんぱい | shinpai | worry | noun,suru-verb,n4
v 彼 | かれ | kare | he | pronoun,n5
v 絶対 | ぜったい | zettai | absolutely | adverb,n4
v 大丈夫 | だいじょうぶ | daijoubu | safe/all right | na-adjective,n5
v 住む | すむ | sumu | to live | verb,godan-verb,intransitive,n5
v 母 | はは | haha | mother | noun,family,n5
v 言う | いう | iu | to say | verb,godan-verb,transitive,n5
v 子供たち | こどもたち | kodomotachi | children | noun,family,n5
v 先生 | せんせい | sensei | teacher | noun,school,n5
v 周り | まわり | mawari | surroundings | noun,n4
v 兄 | あに | ani | older brother | noun,family,n5
v 他人 | たにん | tanin | another person | noun,n4
v 物 | もの | mono | thing | noun,n5
v 教える | おしえる | oshieru | to teach | verb,ichidan-verb,transitive,n5
v 彼女 | かのじょ | kanojo | she | pronoun,n5
v 部屋 | へや | heya | room | noun,house,n5
v きれい | きれい | kirei | clean/pretty | na-adjective,n5
v 一度 | いちど | ichido | once | noun,n5
v 友達 | ともだち | tomodachi | friend | noun,n5
v 隣 | となり | tonari | neighbor | noun,n5
v 奥さん | おくさん | okusan | married lady | noun,family,n5
v 少し | すこし | sukoshi | a little | adverb,n5
v 話 | はなし | hanashi | talk | noun,n5
v 危険 | きけん | kiken | danger | na-adjective,n4
v 並ぶ | ならぶ | narabu | to line up | verb,godan-verb,intransitive,n4
v 立つ | たつ | tatsu | to stand | verb,godan-verb,intransitive,n5
v コーヒー | コーヒー | koohii | coffee | noun,drink,katakana,n5
v 話す | はなす | hanasu | to speak | verb,godan-verb,transitive,n5
v 皆さん | みなさん | minasan | everyone | noun,n5
v なぜ | なぜ | naze | why | adverb,n5
v 集まる | あつまる | atsumaru | to assemble | verb,godan-verb,intransitive,n4
v 分かる | わかる | wakaru | to understand | verb,godan-verb,intransitive,n5
v 学校 | がっこう | gakkou | school | noun,school,n5
v たくさん | たくさん | takusan | many | adverb,n5
v 学生 | がくせい | gakusei | student | noun,school,n5
v 辞書 | じしょ | jisho | dictionary | noun,school,n5
v 何か | なにか | nanika | something | pronoun,n5
v 事 | こと | koto | thing/matter | noun,n5
v 地図 | ちず | chizu | map | noun,n5
v スーパー | スーパー | suupaa | supermarket | noun,place,katakana,n5
v 買い物 | かいもの | kaimono | shopping | noun,suru-verb,n5
v 犬 | いぬ | inu | dog | noun,animal,n5
v 猫 | ねこ | neko | cat | noun,animal,n5
v 来月 | らいげつ | raigetsu | next month | noun,time,n5
v 旅行 | りょこう | ryokou | travel | noun,suru-verb,n4
v 中国語 | ちゅうごくご | chuugokugo | Chinese language | noun,school,n5
v 勉強 | べんきょう | benkyou | study | noun,suru-verb,n5
v 来週 | らいしゅう | raishuu | next week | noun,time,n5
v 英語 | えいご | eigo | English language | noun,school,n5
v 生年月日 | せいねんがっぱい | seinengappi | birth date | noun,n4
v いつも | いつも | itsumo | always | adverb,n5
v うち | うち | uchi | home | noun,house,n5
v 車 | くるま | kuruma | car | noun,transportation,n5
v バス | バス | basu | bus | noun,transportation,katakana,n5
v 郵便局 | ゆうびんきょく | yuubinkyoku | post office | noun,place,n5
v 通る | とおる | tooru | to pass by | verb,godan-verb,intransitive,n5