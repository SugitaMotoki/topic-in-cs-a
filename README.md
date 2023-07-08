# 情報科学特別講義A

## デプロイ先

- https://sugitamotoki.github.io/se-special-lecture-a/

## READMEへのリンク

- [第1回](./src/vm/vm01/)
- [第2回](./src/vm/vm02/)
- [第3回](./src/vm/vm03/)

## ディレクトリ構成

```
src
├── index.html
├── main.ts
├── test_vm.ts # ブラウザを経由せずVMの動作確認をするファイル
└── vm/
    ├── index.ts
    ├── vm01/ # 第1回（2023/05/26）
    │   ├── index.ts
    │   └── postfix_calculator.ts # 後置式電卓
    ├── vm02/ # 第2回（2023/06/09）
    │   ├── README.md
    │   ├── for.ts # ループをfor命令で実装したVM
    │   ├── index.ts
    │   ├── jump.ts # ループをjump命令で実装したVM
    │   ├── loop_virtual_machine.ts # ループを実行するVMの抽象クラス
    │   └── test_vm.ts
    └── vm03/ # 第3回（2023/06/23）
        ├── abstract_vm.ts
        ├── c_vm_prototype.ts
        ├── index.ts
        ├── modules/
        │   ├── function_state.ts
        │   └── index.ts
        └── types/
            ├── error/
            │   ├── index.ts
            │   ├── undefined_address_error.ts
            │   └── vm_error.ts
            ├── index.ts
            ├── instructions.ts
            └── variable.ts
```
