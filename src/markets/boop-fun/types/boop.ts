/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/boop.json`.
 */
export type Boop = {
  "address": "boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4",
  "metadata": {
    "name": "boop",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Boop is a token launcher with fee sharing"
  },
  "instructions": [
    {
      "name": "addOperators",
      "discriminator": [
        165,
        199,
        62,
        214,
        81,
        54,
        4,
        150
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "operators",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "buyToken",
      "discriminator": [
        138,
        127,
        14,
        91,
        38,
        87,
        115,
        105
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "recipientTokenAccount"
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "wsol",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "buyAmount",
          "type": "u64"
        },
        {
          "name": "amountOutMin",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelAuthorityTransfer",
      "discriminator": [
        94,
        131,
        125,
        184,
        183,
        24,
        125,
        229
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeBondingCurveVault",
      "discriminator": [
        189,
        71,
        189,
        239,
        113,
        66,
        59,
        189
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "recipientTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for creating associated token if needed"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "collectTradingFees",
      "discriminator": [
        189,
        38,
        205,
        234,
        81,
        77,
        25,
        1
      ],
      "accounts": [
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocolFeeRecipient",
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "lockProgram",
          "address": "LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE"
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  95,
                  99,
                  112,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockProgram"
            }
          }
        },
        {
          "name": "feeNftAccount",
          "docs": [
            "Fee token account"
          ]
        },
        {
          "name": "lockedLiquidity",
          "docs": [
            "Store the locked the information of liquidity"
          ],
          "writable": true
        },
        {
          "name": "cpmmProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "cpAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "lpMint",
          "docs": [
            "lp mint",
            "address = pool_state.lp_mint"
          ],
          "writable": true
        },
        {
          "name": "recipientToken0Account",
          "docs": [
            "The token account for receive token_0"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "protocolFeeRecipient"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "vault0Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "recipientToken1Account",
          "docs": [
            "The token account for receive token_1"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token_0_vault.mint"
              }
            ]
          }
        },
        {
          "name": "token0Vault",
          "docs": [
            "The address that holds pool tokens for token_0"
          ],
          "writable": true
        },
        {
          "name": "token1Vault",
          "docs": [
            "The address that holds pool tokens for token_1"
          ],
          "writable": true
        },
        {
          "name": "vault0Mint",
          "docs": [
            "The mint of token_0 vault"
          ]
        },
        {
          "name": "vault1Mint",
          "docs": [
            "The mint of token_1 vault"
          ]
        },
        {
          "name": "lockedLpVault",
          "docs": [
            "locked lp token account"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "token Program"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "docs": [
            "Token program 2022"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "memoProgram",
          "docs": [
            "memo program"
          ],
          "address": "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        }
      ],
      "args": []
    },
    {
      "name": "completeAuthorityTransfer",
      "discriminator": [
        81,
        233,
        91,
        132,
        175,
        31,
        151,
        141
      ],
      "accounts": [
        {
          "name": "pendingAuthority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createRaydiumPool",
      "discriminator": [
        65,
        45,
        119,
        77,
        204,
        178,
        84,
        2
      ],
      "accounts": [
        {
          "name": "cpmmProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token0Mint",
          "writable": true
        },
        {
          "name": "token1Mint",
          "docs": [
            "Token_1 mint, the key must be greater than token_0 mint."
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "vaultAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveWsolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  119,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "createPoolFee",
          "docs": [
            "create pool fee account"
          ],
          "writable": true,
          "address": "DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Program to create mint account and mint tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Program to create an ATA for receiving position NFT"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "To create a new program account"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Sysvar for program account"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createRaydiumRandomPool",
      "discriminator": [
        78,
        44,
        173,
        29,
        132,
        180,
        4,
        172
      ],
      "accounts": [
        {
          "name": "cpmmProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "signer": true
        },
        {
          "name": "token0Mint",
          "writable": true
        },
        {
          "name": "token1Mint",
          "docs": [
            "Token_1 mint, the key must be greater than token_0 mint."
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "vaultAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveWsolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  119,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "createPoolFee",
          "docs": [
            "create pool fee account"
          ],
          "writable": true,
          "address": "DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Program to create mint account and mint tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Program to create an ATA for receiving position NFT"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "To create a new program account"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Sysvar for program account"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createToken",
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "arg",
                "path": "salt"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "createTokenFallback",
      "discriminator": [
        253,
        184,
        126,
        199,
        235,
        232,
        172,
        162
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "salt"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deployBondingCurve",
      "discriminator": [
        180,
        89,
        199,
        76,
        168,
        236,
        217,
        138
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "arg",
                "path": "salt"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "salt",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deployBondingCurveFallback",
      "discriminator": [
        53,
        230,
        172,
        84,
        77,
        174,
        22,
        61
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "salt"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "salt",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositIntoRaydium",
      "discriminator": [
        168,
        89,
        99,
        30,
        117,
        49,
        88,
        224
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "operatorWsolAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "operator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveWsolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  119,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "token Program"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "docs": [
            "Token program 2022"
          ],
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Program to create an ATA for the operator to recoup any potential remaining WSOL"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "cpmmProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "ownerLpToken",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0Mint",
          "writable": true
        },
        {
          "name": "token1Mint",
          "docs": [
            "token_1 mint, the key must greater than token_0 mint"
          ],
          "address": "So11111111111111111111111111111111111111112"
        }
      ],
      "args": [
        {
          "name": "lpTokenAmount",
          "type": "u64"
        },
        {
          "name": "maximumToken0Amount",
          "type": "u64"
        },
        {
          "name": "maximumToken1Amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "graduate",
      "discriminator": [
        45,
        235,
        225,
        181,
        17,
        218,
        64,
        130
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "wsol",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "protocolFeeRecipient",
          "writable": true
        },
        {
          "name": "tokenDistributor"
        },
        {
          "name": "tokenDistributorTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenDistributor"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurveSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveWsolAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  119,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocolFeeRecipient",
          "type": "pubkey"
        },
        {
          "name": "tokenDistributor",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initiateAuthorityTransfer",
      "discriminator": [
        210,
        43,
        101,
        215,
        119,
        140,
        106,
        218
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "lockRaydiumLiquidity",
      "discriminator": [
        173,
        255,
        148,
        6,
        122,
        99,
        140,
        22
      ],
      "accounts": [
        {
          "name": "lockProgram",
          "address": "LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE"
        },
        {
          "name": "vaultAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  95,
                  99,
                  112,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockProgram"
            }
          }
        },
        {
          "name": "feeNftOwner"
        },
        {
          "name": "feeNftMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeNftAccount",
          "writable": true
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "lockedLiquidity",
          "docs": [
            "Store the locked information of liquidity"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107,
                  101,
                  100,
                  95,
                  108,
                  105,
                  113,
                  117,
                  105,
                  100,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "feeNftMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "lockProgram"
            }
          }
        },
        {
          "name": "lpMint",
          "docs": [
            "The mint of liquidity token"
          ],
          "writable": true
        },
        {
          "name": "liquidityOwnerLp",
          "docs": [
            "liquidity owner lp token account"
          ],
          "writable": true
        },
        {
          "name": "lockedLpVault",
          "writable": true
        },
        {
          "name": "token0Vault",
          "docs": [
            "The address that holds pool tokens for token_0"
          ],
          "writable": true
        },
        {
          "name": "token1Vault",
          "docs": [
            "The address that holds pool tokens for token_1"
          ],
          "writable": true
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token_0_vault.mint"
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "docs": [
            "To store metaplex metadata"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "feeNftMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "rent",
          "docs": [
            "Sysvar for token mint and ATA creation"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Program to create the new account"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Program to create/transfer mint/token account"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Program to create an ATA for receiving fee NFT"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "metadataProgram",
          "docs": [
            "Program to create NFT metadata accunt"
          ],
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": []
    },
    {
      "name": "removeOperators",
      "discriminator": [
        42,
        20,
        89,
        83,
        222,
        37,
        4,
        109
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "operators",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "sellToken",
      "discriminator": [
        109,
        61,
        40,
        187,
        230,
        176,
        135,
        174
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveSolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "sellerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "sellAmount",
          "type": "u64"
        },
        {
          "name": "amountOutMin",
          "type": "u64"
        }
      ]
    },
    {
      "name": "splitTradingFees",
      "discriminator": [
        96,
        126,
        225,
        47,
        185,
        213,
        50,
        58
      ],
      "accounts": [
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "wsol",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeesVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "feeSplitterProgram",
          "address": "boopEYztaEYSnajfMtjcRysyzyRcchgKsPboRZEbnJi"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "feeSplitterConfig"
        },
        {
          "name": "feeSplitterCreatorVault",
          "writable": true
        },
        {
          "name": "feeSplitterVaultAuthority",
          "writable": true
        },
        {
          "name": "feeSplitterCreatorVaultAuthority",
          "writable": true
        },
        {
          "name": "feeSplitterStakingMint"
        },
        {
          "name": "feeSplitterWsolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeSplitterVaultAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "wsol"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeSplitterCreatorVaultAuthorityWsolVault",
          "writable": true
        },
        {
          "name": "feeSplitterTreasuryWsolVault",
          "writable": true
        },
        {
          "name": "feeSplitterTeamWsolVault",
          "writable": true
        },
        {
          "name": "feeSplitterRewardPool",
          "writable": true
        },
        {
          "name": "feeSplitterRewardPoolStakingVault",
          "writable": true
        },
        {
          "name": "feeSplitterRewardPoolRewardVault",
          "writable": true
        },
        {
          "name": "feeSplitterRewardPoolProgram"
        }
      ],
      "args": []
    },
    {
      "name": "swapSolForTokensOnRaydium",
      "discriminator": [
        107,
        248,
        131,
        239,
        152,
        234,
        54,
        35
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              }
            ]
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "inputVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "outputVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveWsolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  119,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              }
            ]
          }
        },
        {
          "name": "outputTokenMint",
          "docs": [
            "token_0 mint, the key must smaller than token_1 mint"
          ]
        },
        {
          "name": "inputTokenMint",
          "docs": [
            "token_1 mint, the key must greater than token_0 mint"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "input_token_mint and output_token_mint have the same token program"
          ]
        },
        {
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapTokensForSolOnRaydium",
      "discriminator": [
        216,
        172,
        130,
        148,
        34,
        98,
        215,
        163
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              }
            ]
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "inputVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "outputVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "outputTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                169,
                42,
                90,
                139,
                79,
                41,
                89,
                82,
                132,
                37,
                80,
                170,
                147,
                253,
                91,
                149,
                181,
                172,
                230,
                168,
                235,
                146,
                12,
                147,
                148,
                46,
                67,
                105,
                12,
                32,
                236,
                115
              ]
            }
          }
        },
        {
          "name": "bondingCurveVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveWsolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  119,
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "inputTokenMint"
              }
            ]
          }
        },
        {
          "name": "inputTokenMint",
          "docs": [
            "token_0 mint, the key must smaller than token_1 mint"
          ]
        },
        {
          "name": "outputTokenMint",
          "docs": [
            "token_1 mint, the key must greater than token_0 mint"
          ],
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "input_token_mint and output_token_mint have the same token program"
          ]
        },
        {
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minimumAmountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "togglePaused",
      "discriminator": [
        54,
        83,
        147,
        198,
        123,
        97,
        218,
        72
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newProtocolFeeRecipient",
          "type": "pubkey"
        },
        {
          "name": "newVirtualSolReserves",
          "type": "u64"
        },
        {
          "name": "newVirtualTokenReserves",
          "type": "u64"
        },
        {
          "name": "newGraduationTarget",
          "type": "u64"
        },
        {
          "name": "newGraduationFee",
          "type": "u64"
        },
        {
          "name": "newDampingTerm",
          "type": "u8"
        },
        {
          "name": "newSwapFeeBasisPoints",
          "type": "u8"
        },
        {
          "name": "newTokenForStakersBasisPoints",
          "type": "u16"
        },
        {
          "name": "newTokenAmountForRaydiumLiquidity",
          "type": "u64"
        },
        {
          "name": "newMaxGraduationPriceDeviationBasisPoints",
          "type": "u16"
        },
        {
          "name": "newMaxSwapAmountForPoolPriceCorrectionBasisPoints",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ammConfig",
      "discriminator": [
        218,
        244,
        33,
        104,
        203,
        203,
        43,
        111
      ]
    },
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "lockedCpLiquidityState",
      "discriminator": [
        25,
        10,
        238,
        197,
        207,
        234,
        73,
        22
      ]
    }
  ],
  "events": [
    {
      "name": "authorityTransferCancelledEvent",
      "discriminator": [
        192,
        121,
        140,
        224,
        229,
        96,
        13,
        143
      ]
    },
    {
      "name": "authorityTransferCompletedEvent",
      "discriminator": [
        163,
        132,
        217,
        128,
        243,
        92,
        90,
        249
      ]
    },
    {
      "name": "authorityTransferInitiatedEvent",
      "discriminator": [
        121,
        246,
        95,
        155,
        229,
        109,
        148,
        205
      ]
    },
    {
      "name": "bondingCurveDeployedEvent",
      "discriminator": [
        225,
        80,
        178,
        34,
        217,
        39,
        184,
        148
      ]
    },
    {
      "name": "bondingCurveDeployedFallbackEvent",
      "discriminator": [
        106,
        252,
        243,
        115,
        199,
        159,
        247,
        31
      ]
    },
    {
      "name": "bondingCurveVaultClosedEvent",
      "discriminator": [
        185,
        36,
        156,
        82,
        189,
        164,
        207,
        79
      ]
    },
    {
      "name": "configUpdatedEvent",
      "discriminator": [
        245,
        158,
        129,
        99,
        60,
        100,
        214,
        220
      ]
    },
    {
      "name": "liquidityDepositedIntoRaydiumEvent",
      "discriminator": [
        236,
        50,
        97,
        27,
        198,
        101,
        248,
        20
      ]
    },
    {
      "name": "operatorsAddedEvent",
      "discriminator": [
        247,
        58,
        112,
        56,
        203,
        186,
        112,
        152
      ]
    },
    {
      "name": "operatorsRemovedEvent",
      "discriminator": [
        44,
        72,
        75,
        70,
        151,
        42,
        53,
        89
      ]
    },
    {
      "name": "pausedToggledEvent",
      "discriminator": [
        143,
        222,
        228,
        224,
        6,
        230,
        64,
        176
      ]
    },
    {
      "name": "raydiumLiquidityLockedEvent",
      "discriminator": [
        172,
        189,
        8,
        241,
        137,
        175,
        59,
        100
      ]
    },
    {
      "name": "raydiumPoolCreatedEvent",
      "discriminator": [
        170,
        178,
        21,
        215,
        84,
        222,
        34,
        101
      ]
    },
    {
      "name": "raydiumRandomPoolCreatedEvent",
      "discriminator": [
        152,
        251,
        128,
        152,
        158,
        235,
        83,
        53
      ]
    },
    {
      "name": "swapSolForTokensOnRaydiumEvent",
      "discriminator": [
        247,
        1,
        8,
        166,
        221,
        116,
        113,
        98
      ]
    },
    {
      "name": "swapTokensForSolOnRaydiumEvent",
      "discriminator": [
        76,
        249,
        221,
        162,
        65,
        70,
        118,
        32
      ]
    },
    {
      "name": "tokenBoughtEvent",
      "discriminator": [
        71,
        89,
        222,
        124,
        215,
        192,
        230,
        138
      ]
    },
    {
      "name": "tokenCreatedEvent",
      "discriminator": [
        96,
        122,
        113,
        138,
        50,
        227,
        149,
        57
      ]
    },
    {
      "name": "tokenCreatedFallbackEvent",
      "discriminator": [
        157,
        202,
        35,
        92,
        165,
        163,
        39,
        56
      ]
    },
    {
      "name": "tokenGraduatedEvent",
      "discriminator": [
        73,
        116,
        111,
        26,
        92,
        217,
        146,
        141
      ]
    },
    {
      "name": "tokenSoldEvent",
      "discriminator": [
        204,
        239,
        182,
        77,
        241,
        51,
        77,
        66
      ]
    },
    {
      "name": "tradingFeesCollectedEvent",
      "discriminator": [
        225,
        63,
        26,
        55,
        134,
        243,
        210,
        203
      ]
    },
    {
      "name": "tradingFeesSplitEvent",
      "discriminator": [
        113,
        60,
        159,
        17,
        253,
        174,
        135,
        122
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "amountInTooLow",
      "msg": "Amount in too low"
    },
    {
      "code": 6001,
      "name": "amountOutTooLow",
      "msg": "Amount out too low"
    },
    {
      "code": 6002,
      "name": "configNotInitialized",
      "msg": "Config not initialized"
    },
    {
      "code": 6003,
      "name": "creatorIsNotProvided",
      "msg": "Creator is not provided"
    },
    {
      "code": 6004,
      "name": "dampingTermTooLow",
      "msg": "Damping term too low"
    },
    {
      "code": 6005,
      "name": "firstBuyMustBeAtMost50PercentOfTotalSupply",
      "msg": "First buy must be at most 50% of the total supply"
    },
    {
      "code": 6006,
      "name": "graduationFeeRelativeToTargetIsTooHigh",
      "msg": "Graduation fee relative to graduation target is too high"
    },
    {
      "code": 6007,
      "name": "insufficientTokensOut",
      "msg": "Insufficient tokens to transfer out of the bonding curve"
    },
    {
      "code": 6008,
      "name": "invalidBondingCurveStatus",
      "msg": "Invalid bonding curve status"
    },
    {
      "code": 6009,
      "name": "invalidDampingTerm",
      "msg": "Invalid damping term"
    },
    {
      "code": 6010,
      "name": "invalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6011,
      "name": "invalidProtocolFeeRecipient",
      "msg": "Invalid protocol fee recipient"
    },
    {
      "code": 6012,
      "name": "maxBasisPointsOffGraduationPriceTooHigh",
      "msg": "Max basis points off graduation price too high"
    },
    {
      "code": 6013,
      "name": "maxGraduationPriceDeviationBasisPointsTooHigh",
      "msg": "Max graduation price deviation basis points too high"
    },
    {
      "code": 6014,
      "name": "maxSwapAmountForPoolPriceCorrectionBasisPointsTooHigh",
      "msg": "Max swap amount for pool price correction basis points too high"
    },
    {
      "code": 6015,
      "name": "mintIsLargerThanOrEqualToNativeMint",
      "msg": "Mint is larger than or equal to native mint"
    },
    {
      "code": 6016,
      "name": "noAuthorityTransferInProgress",
      "msg": "No authority transfer in progress"
    },
    {
      "code": 6017,
      "name": "nothingToDeposit",
      "msg": "LP Token amount is too low"
    },
    {
      "code": 6018,
      "name": "nothingToSplit",
      "msg": "Nothing to split"
    },
    {
      "code": 6019,
      "name": "nothingToLock",
      "msg": "Nothing to lock"
    },
    {
      "code": 6020,
      "name": "operatorAlreadyAdded",
      "msg": "Operator already added"
    },
    {
      "code": 6021,
      "name": "operatorDoesNotExist",
      "msg": "Operator does not exist"
    },
    {
      "code": 6022,
      "name": "paused",
      "msg": "paused"
    },
    {
      "code": 6023,
      "name": "poolPriceOutOfRange",
      "msg": "Pool is already created and has a price out of range when attempting to deposit liquidity"
    },
    {
      "code": 6024,
      "name": "swapFeeBasisPointsTooHigh",
      "msg": "Swap fee basis points too high"
    },
    {
      "code": 6025,
      "name": "swapAmountTooHigh",
      "msg": "Swap amount exceeds the reasonable limit to leave as liquidity"
    },
    {
      "code": 6026,
      "name": "tokenAmountForRaydiumLiquidityTooHigh",
      "msg": "Token amount for Raydium liquidity too high"
    },
    {
      "code": 6027,
      "name": "tokenForStakersBasisPointsTooHigh",
      "msg": "Token for stakers basis points too high"
    },
    {
      "code": 6028,
      "name": "tokenGraduated",
      "msg": "Token graduated"
    },
    {
      "code": 6029,
      "name": "tokenNameTooLong",
      "msg": "Token name too long"
    },
    {
      "code": 6030,
      "name": "tokenNameTooShort",
      "msg": "Token name too short"
    },
    {
      "code": 6031,
      "name": "tokenSymbolTooLong",
      "msg": "Token symbol too long"
    },
    {
      "code": 6032,
      "name": "tokenSymbolTooShort",
      "msg": "Token symbol too short"
    },
    {
      "code": 6033,
      "name": "unauthorized",
      "msg": "unauthorized"
    }
  ],
  "types": [
    {
      "name": "ammConfig",
      "docs": [
        "Holds the current owner of the factory"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "disableCreatePool",
            "docs": [
              "Status to control if new pool can be create"
            ],
            "type": "bool"
          },
          {
            "name": "index",
            "docs": [
              "Config index"
            ],
            "type": "u16"
          },
          {
            "name": "tradeFeeRate",
            "docs": [
              "The trade fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeeRate",
            "docs": [
              "The protocol fee"
            ],
            "type": "u64"
          },
          {
            "name": "fundFeeRate",
            "docs": [
              "The fund fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "createPoolFee",
            "docs": [
              "Fee for create a new pool"
            ],
            "type": "u64"
          },
          {
            "name": "protocolOwner",
            "docs": [
              "Address of the protocol fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "fundOwner",
            "docs": [
              "Address of the fund fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "padding"
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "authorityTransferCancelledEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "authorityTransferCompletedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAuthority",
            "type": "pubkey"
          },
          {
            "name": "newAuthority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "authorityTransferInitiatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAuthority",
            "type": "pubkey"
          },
          {
            "name": "newAuthority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "docs": [
              "virtual token reserves is deprecated, we now use the xyk formula instead",
              "and it only requires virtual sol reserves",
              "to maintain backwards compatibility, if damping term is 30, we use the old formula",
              "and we still need virtual_token_reserves to be set correctly"
            ],
            "type": "u64"
          },
          {
            "name": "graduationTarget",
            "type": "u64"
          },
          {
            "name": "graduationFee",
            "type": "u64"
          },
          {
            "name": "solReserves",
            "type": "u64"
          },
          {
            "name": "tokenReserves",
            "type": "u64"
          },
          {
            "name": "dampingTerm",
            "docs": [
              "In reality, this is now more like a bonding_curve_selector"
            ],
            "type": "u8"
          },
          {
            "name": "swapFeeBasisPoints",
            "type": "u8"
          },
          {
            "name": "tokenForStakersBasisPoints",
            "type": "u16"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "bondingCurveStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "bondingCurveDeployedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "bondingCurveDeployedFallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "bondingCurveStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "trading"
          },
          {
            "name": "graduated"
          },
          {
            "name": "poolPriceCorrected"
          },
          {
            "name": "liquidityProvisioned"
          },
          {
            "name": "liquidityLocked"
          }
        ]
      }
    },
    {
      "name": "bondingCurveVaultClosedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "pendingAuthority",
            "type": "pubkey"
          },
          {
            "name": "operators",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "protocolFeeRecipient",
            "type": "pubkey"
          },
          {
            "name": "tokenDistributor",
            "type": "pubkey"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "graduationTarget",
            "type": "u64"
          },
          {
            "name": "graduationFee",
            "type": "u64"
          },
          {
            "name": "dampingTerm",
            "type": "u8"
          },
          {
            "name": "tokenForStakersBasisPoints",
            "type": "u16"
          },
          {
            "name": "swapFeeBasisPoints",
            "type": "u8"
          },
          {
            "name": "tokenAmountForRaydiumLiquidity",
            "type": "u64"
          },
          {
            "name": "maxGraduationPriceDeviationBasisPoints",
            "type": "u16"
          },
          {
            "name": "maxSwapAmountForPoolPriceCorrectionBasisPoints",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "configUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocolFeeRecipient",
            "type": "pubkey"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "graduationTarget",
            "type": "u64"
          },
          {
            "name": "graduationFee",
            "type": "u64"
          },
          {
            "name": "dampingTerm",
            "type": "u8"
          },
          {
            "name": "swapFeeBasisPoints",
            "type": "u8"
          },
          {
            "name": "tokenForStakersBasisPoints",
            "type": "u16"
          },
          {
            "name": "tokenAmountForRaydiumLiquidity",
            "type": "u64"
          },
          {
            "name": "maxGraduationPriceDeviationBasisPoints",
            "type": "u16"
          },
          {
            "name": "maxSwapAmountForPoolPriceCorrectionBasisPoints",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "liquidityDepositedIntoRaydiumEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolState",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "lpTokenAmount",
            "type": "u64"
          },
          {
            "name": "tokensDeposited",
            "type": "u64"
          },
          {
            "name": "wsolDeposited",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lockedCpLiquidityState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lockedLpAmount",
            "docs": [
              "The Locked liquidity amount without claimed lp fee"
            ],
            "type": "u64"
          },
          {
            "name": "claimedLpAmount",
            "docs": [
              "Claimed lp fee amount"
            ],
            "type": "u64"
          },
          {
            "name": "unclaimedLpAmount",
            "docs": [
              "Unclaimed lp fee amount"
            ],
            "type": "u64"
          },
          {
            "name": "lastLp",
            "docs": [
              "Last updated cp pool lp total supply"
            ],
            "type": "u64"
          },
          {
            "name": "lastK",
            "docs": [
              "Last updated cp pool k"
            ],
            "type": "u128"
          },
          {
            "name": "recentEpoch",
            "docs": [
              "Account update recent epoch"
            ],
            "type": "u64"
          },
          {
            "name": "poolId",
            "docs": [
              "The ID of the pool with which this record is connected"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeNftMint",
            "docs": [
              "nft mint to check who has authority to collect fee"
            ],
            "type": "pubkey"
          },
          {
            "name": "lockedOwner",
            "docs": [
              "The owner who has locked liquidity"
            ],
            "type": "pubkey"
          },
          {
            "name": "lockedLpMint",
            "docs": [
              "The mint of locked lp token"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "Unused bytes for future upgrades."
            ],
            "type": {
              "array": [
                "u64",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "operatorsAddedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operators",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "operatorsRemovedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operators",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "pausedToggledEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isPaused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "raydiumLiquidityLockedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolState",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "lpAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "raydiumPoolCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolState",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "raydiumRandomPoolCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolState",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "swapSolForTokensOnRaydiumEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "swapTokensForSolOnRaydiumEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenBoughtEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "swapFee",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokenCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "tokenCreatedFallbackEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "tokenGraduatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "solForLiquidity",
            "type": "u64"
          },
          {
            "name": "graduationFee",
            "type": "u64"
          },
          {
            "name": "tokenForDistributor",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenSoldEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "swapFee",
            "type": "u64"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tradingFeesCollectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolState",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tradingFeesSplitEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
