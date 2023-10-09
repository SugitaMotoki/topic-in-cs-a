# 自作仮想マシン

- 情報科学特別講義Aで作成した、オリジナルアセンブリ言語の仮想マシンです。
- オリジナルアセンブリ言語は、Cから生成することを想定して設計しました。
- ブラウザ上で動作させるため、TypeScriptで実装しています。
- 将来的には、ブラウザで動くCの仮想マシンにしたいと考えています。

# 実行方法

```shell
$ git clone git@github.com:SugitaMotoki/topic-in-cs-a.git
$ cd topic-in-cs-a
$ npm install
$ npm run dev # 開発用
```

# ファイル構造

```shell
.
├── README.md
├── app.vue
├── layouts
│   └── default.vue
├── pages
│   └── index.vue
├── sample
│   ├── add.c
│   ├── assembly.ts
│   ├── foo
│   ├── foo.c
│   ├── foo.o
│   ├── foo.s
│   ├── instruction.ts
│   └── union.ts
└── utils/
    ├── index.ts
    ├── interpreter # 最終成果物
    │   ├── c-interpreter
    │   │   ├── assembler # オリジナルアセンブリを解析するアセンブラ
    │   │   ├── compiler # Cからオリジナルアセンブリを生成するコンパイラ（未実装）
    │   │   ├── id-map
    │   │   ├── index.ts
    │   │   ├── specifications
    │   │   ├── types
    │   │   └── virtual-machine # 仮想マシン本体
    │   └── index.ts
    └── vm # 授業の途中で作成したプロトタイプ
        ├── index.ts
        ├── vm01
        ├── vm02
        ├── vm03
        └── vm04
```

# 命令セット

詳しくは`utils/interpreter/c-interpreter/virtual-machine/index.ts`を参照。

- print
- pop
- push
- add
- mul
- div
- mod
- eq
- ne
- gt
- ge
- lt
- le
- increment
- decrement
- jump
- jumpIf
- declareGlobal
- setGlobal
- getGlobal
- declareLocal
- setLocal
- getLocal
- call
- return

