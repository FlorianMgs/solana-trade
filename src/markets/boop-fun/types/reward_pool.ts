/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/reward_pool.json`.
 */
export type RewardPool = {
  "address": "boopURdYr29D4C4BX7UWfi7rHQyinzCb4XRac3SHR85",
  "metadata": {
    "name": "rewardPool",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addFunders",
      "discriminator": [
        23,
        209,
        67,
        31,
        0,
        206,
        198,
        249
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "funders",
          "type": {
            "vec": "pubkey"
          }
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
            "pool"
          ]
        },
        {
          "name": "pool",
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
      "name": "claimReward",
      "discriminator": [
        149,
        95,
        181,
        242,
        94,
        90,
        158,
        162
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "stakingMint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "rewardMint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "stakingVault",
          "writable": true
        },
        {
          "name": "rewardVault",
          "writable": true
        },
        {
          "name": "userRewardMintAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "staker"
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
                "path": "rewardMint"
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
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "staker",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "closeUser",
      "discriminator": [
        86,
        219,
        138,
        140,
        236,
        24,
        118,
        200
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "staker",
          "writable": true,
          "signer": true
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
            "pool"
          ]
        },
        {
          "name": "pool",
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
      "name": "fund",
      "discriminator": [
        218,
        188,
        111,
        221,
        152,
        113,
        174,
        7
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "stakingVault",
          "writable": true
        },
        {
          "name": "rewardVault",
          "writable": true
        },
        {
          "name": "funderTokenAccount",
          "writable": true
        },
        {
          "name": "stakingMint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "rewardMint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePool",
      "discriminator": [
        95,
        180,
        10,
        172,
        84,
        174,
        232,
        40
      ],
      "accounts": [
        {
          "name": "stakingMint"
        },
        {
          "name": "stakingVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
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
                "path": "stakingMint"
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
          "name": "rewardMint"
        },
        {
          "name": "rewardVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
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
                "path": "rewardMint"
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
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
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
          "name": "rewardDuration",
          "type": "u64"
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
            "pool"
          ]
        },
        {
          "name": "pool",
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
      "name": "removeFunders",
      "discriminator": [
        213,
        157,
        8,
        111,
        200,
        42,
        112,
        92
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "pool"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "funders",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "stake",
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "stakingMint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "stakingVault",
          "writable": true
        },
        {
          "name": "userStakingMintAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "staker"
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
                "path": "stakingMint"
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
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "staker",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstake",
      "discriminator": [
        90,
        95,
        107,
        42,
        205,
        124,
        50,
        225
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "stakingMint",
          "relations": [
            "pool"
          ]
        },
        {
          "name": "stakingVault",
          "writable": true
        },
        {
          "name": "userStakingMintAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "staker"
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
                "path": "stakingMint"
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
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "staker",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePool",
      "discriminator": [
        239,
        214,
        170,
        78,
        36,
        35,
        30,
        34
      ],
      "accounts": [
        {
          "name": "pool",
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
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "pool"
          ]
        }
      ],
      "args": [
        {
          "name": "minStakedAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
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
      "name": "fundedEvent",
      "discriminator": [
        184,
        241,
        25,
        25,
        217,
        159,
        102,
        174
      ]
    },
    {
      "name": "fundersAddedEvent",
      "discriminator": [
        150,
        4,
        253,
        198,
        25,
        12,
        74,
        94
      ]
    },
    {
      "name": "fundersRemovedEvent",
      "discriminator": [
        213,
        79,
        125,
        2,
        211,
        189,
        39,
        237
      ]
    },
    {
      "name": "poolUpdatedEvent",
      "discriminator": [
        128,
        39,
        94,
        221,
        230,
        222,
        127,
        141
      ]
    },
    {
      "name": "rewardClaimedEvent",
      "discriminator": [
        246,
        43,
        215,
        228,
        82,
        49,
        230,
        56
      ]
    },
    {
      "name": "stakedEvent",
      "discriminator": [
        81,
        221,
        186,
        176,
        240,
        160,
        193,
        69
      ]
    },
    {
      "name": "unstakedEvent",
      "discriminator": [
        186,
        174,
        247,
        231,
        242,
        159,
        68,
        128
      ]
    },
    {
      "name": "userClosedEvent",
      "discriminator": [
        90,
        192,
        139,
        28,
        156,
        216,
        120,
        169
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "accountNotEmpty",
      "msg": "Account not empty"
    },
    {
      "code": 6001,
      "name": "durationTooShort",
      "msg": "Duration too short"
    },
    {
      "code": 6002,
      "name": "funderAlreadyAdded",
      "msg": "Funder already added"
    },
    {
      "code": 6003,
      "name": "funderDoesNotExist",
      "msg": "Funder does not exist"
    },
    {
      "code": 6004,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6005,
      "name": "minimumStakedAmountNotMet",
      "msg": "Minimum staked amount not met"
    },
    {
      "code": 6006,
      "name": "noAuthorityTransferInProgress",
      "msg": "No authority transfer in progress"
    },
    {
      "code": 6007,
      "name": "noRewardToClaim",
      "msg": "No reward to claim"
    },
    {
      "code": 6008,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6009,
      "name": "zeroAmount",
      "msg": "Zero amount"
    },
    {
      "code": 6010,
      "name": "zeroRewardRate",
      "msg": "Zero reward rate"
    }
  ],
  "types": [
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
      "name": "fundedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "funder",
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
      "name": "fundersAddedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "funders",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "fundersRemovedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "funders",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "authority of the pool."
            ],
            "type": "pubkey"
          },
          {
            "name": "pendingAuthority",
            "docs": [
              "pending authority of the pool. Used for 2 step authority transfer."
            ],
            "type": "pubkey"
          },
          {
            "name": "stakingMint",
            "docs": [
              "Mint of the token that can be staked."
            ],
            "type": "pubkey"
          },
          {
            "name": "rewardMint",
            "docs": [
              "Mint of the reward A token."
            ],
            "type": "pubkey"
          },
          {
            "name": "rewardDuration",
            "docs": [
              "The period which rewards are linearly distributed."
            ],
            "type": "u64"
          },
          {
            "name": "rewardDurationEnd",
            "docs": [
              "The timestamp at which the current reward period ends."
            ],
            "type": "u64"
          },
          {
            "name": "lastUpdateTime",
            "docs": [
              "The last time reward states were updated."
            ],
            "type": "u64"
          },
          {
            "name": "rewardRate",
            "docs": [
              "Rate of reward distribution."
            ],
            "type": "u64"
          },
          {
            "name": "rewardPerTokenStored",
            "docs": [
              "Last calculated reward per pool token."
            ],
            "type": "u128"
          },
          {
            "name": "userStakeCount",
            "docs": [
              "Users staked"
            ],
            "type": "u32"
          },
          {
            "name": "funders",
            "docs": [
              "authorized funders"
            ],
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "minStakedAmount",
            "docs": [
              "minimum amount of staked tokens to be eligible for rewards"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poolUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minStakedAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
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
      "name": "stakedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
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
      "name": "unstakedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
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
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardPerTokenComplete",
            "docs": [
              "The amount of token claimed."
            ],
            "type": "u128"
          },
          {
            "name": "rewardPerTokenPending",
            "docs": [
              "The amount of token pending claim."
            ],
            "type": "u64"
          },
          {
            "name": "balanceStaked",
            "docs": [
              "The amount staked."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userClosedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "staker",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
