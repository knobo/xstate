import { assert } from 'chai';
import { raise, assign } from '../src/actions';
import { Machine } from '../src/Machine';
import { testMultiTransition } from './utils';

const composerMachine = Machine({
  strict: true,
  initial: 'ReadOnly',
  states: {
    ReadOnly: {
      id: 'ReadOnly',
      initial: 'StructureEdit',
      onEntry: ['selectNone'],
      states: {
        StructureEdit: {
          id: 'StructureEditRO',
          type: 'parallel',
          on: {
            switchToProjectManagement: [
              {
                target: 'ProjectManagement'
              }
            ]
          },
          states: {
            SelectionStatus: {
              initial: 'SelectedNone',
              on: {
                singleClickActivity: [
                  {
                    target: '.SelectedActivity',
                    actions: ['selectActivity']
                  }
                ],
                singleClickLink: [
                  {
                    target: '.SelectedLink',
                    actions: ['selectLink']
                  }
                ]
              },
              states: {
                SelectedNone: {
                  onEntry: ['redraw']
                },
                SelectedActivity: {
                  onEntry: ['redraw'],
                  on: {
                    singleClickCanvas: [
                      {
                        target: 'SelectedNone',
                        actions: ['selectNone']
                      }
                    ]
                  }
                },
                SelectedLink: {
                  onEntry: ['redraw'],
                  on: {
                    singleClickCanvas: [
                      {
                        target: 'SelectedNone',
                        actions: ['selectNone']
                      }
                    ]
                  }
                }
              }
            },
            ClipboardStatus: {
              initial: 'Empty',
              states: {
                Empty: {
                  onEntry: ['emptyClipboard'],
                  on: {
                    cutInClipboardSuccess: [
                      {
                        target: 'FilledByCut'
                      }
                    ],
                    copyInClipboardSuccess: [
                      {
                        target: 'FilledByCopy'
                      }
                    ]
                  }
                },
                FilledByCopy: {
                  on: {
                    cutInClipboardSuccess: [
                      {
                        target: 'FilledByCut'
                      }
                    ],
                    copyInClipboardSuccess: [
                      {
                        target: 'FilledByCopy'
                      }
                    ],
                    pasteFromClipboardSuccess: [
                      {
                        target: 'FilledByCopy'
                      }
                    ]
                  }
                },
                FilledByCut: {
                  on: {
                    cutInClipboardSuccess: [
                      {
                        target: 'FilledByCut'
                      }
                    ],
                    copyInClipboardSuccess: [
                      {
                        target: 'FilledByCopy'
                      }
                    ],
                    pasteFromClipboardSuccess: [
                      {
                        target: 'Empty'
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        ProjectManagement: {
          id: 'ProjectManagementRO',
          type: 'parallel',
          on: {
            switchToStructureEdit: [
              {
                target: 'StructureEdit'
              }
            ]
          },
          states: {
            SelectionStatus: {
              initial: 'SelectedNone',
              on: {
                singleClickActivity: [
                  {
                    target: '.SelectedActivity',
                    actions: ['selectActivity']
                  }
                ],
                singleClickLink: [
                  {
                    target: '.SelectedLink',
                    actions: ['selectLink']
                  }
                ]
              },
              states: {
                SelectedNone: {
                  onEntry: ['redraw']
                },
                SelectedActivity: {
                  onEntry: ['redraw'],
                  on: {
                    singleClickCanvas: [
                      {
                        target: 'SelectedNone',
                        actions: ['selectNone']
                      }
                    ]
                  }
                },
                SelectedLink: {
                  onEntry: ['redraw'],
                  on: {
                    singleClickCanvas: [
                      {
                        target: 'SelectedNone',
                        actions: ['selectNone']
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

const wakMachine = Machine({
  id: 'wakMachine',
  type: 'parallel',
  strict: true,
  states: {
    wak1: {
      initial: 'wak1sonA',
      states: {
        wak1sonA: {
          onEntry: 'wak1sonAenter',
          onExit: 'wak1sonAexit'
        },
        wak1sonB: {
          onEntry: 'wak1sonBenter',
          onExit: 'wak1sonBexit'
        }
      },
      on: {
        WAK1: '.wak1sonB'
      },
      onEntry: 'wak1enter',
      onExit: 'wak1exit'
    },
    wak2: {
      initial: 'wak2sonA',
      states: {
        wak2sonA: {
          onEntry: 'wak2sonAenter',
          onExit: 'wak2sonAexit'
        },
        wak2sonB: {
          onEntry: 'wak2sonBenter',
          onExit: 'wak2sonBexit'
        }
      },
      on: {
        WAK2: '.wak2sonB'
      },
      onEntry: 'wak2enter',
      onExit: 'wak2exit'
    }
  }
});

const wordMachine = Machine({
  id: 'word',
  type: 'parallel',
  states: {
    bold: {
      initial: 'off',
      states: {
        on: {
          on: { TOGGLE_BOLD: 'off' }
        },
        off: {
          on: { TOGGLE_BOLD: 'on' }
        }
      }
    },
    underline: {
      initial: 'off',
      states: {
        on: {
          on: { TOGGLE_UNDERLINE: 'off' }
        },
        off: {
          on: { TOGGLE_UNDERLINE: 'on' }
        }
      }
    },
    italics: {
      initial: 'off',
      states: {
        on: {
          on: { TOGGLE_ITALICS: 'off' }
        },
        off: {
          on: { TOGGLE_ITALICS: 'on' }
        }
      }
    },
    list: {
      initial: 'none',
      states: {
        none: {
          on: { BULLETS: 'bullets', NUMBERS: 'numbers' }
        },
        bullets: {
          on: { NONE: 'none', NUMBERS: 'numbers' }
        },
        numbers: {
          on: { BULLETS: 'bullets', NONE: 'none' }
        }
      }
    }
  },
  on: {
    RESET: '#word' // TODO: this should be 'word' or [{ internal: false }]
  }
});

const flatParallelMachine = Machine({
  type: 'parallel',
  states: {
    foo: {},
    bar: {},
    baz: {
      initial: 'one',
      states: {
        one: { on: { E: 'two' } },
        two: {}
      }
    }
  }
});

const raisingParallelMachine = Machine({
  strict: true,
  type: 'parallel',
  states: {
    OUTER1: {
      initial: 'C',
      states: {
        A: {
          onEntry: [raise('TURN_OFF')],
          on: {
            EVENT_OUTER1_B: 'B',
            EVENT_OUTER1_C: 'C'
          }
        },
        B: {
          onEntry: [raise('TURN_ON')],
          on: {
            EVENT_OUTER1_A: 'A',
            EVENT_OUTER1_C: 'C'
          }
        },
        C: {
          onEntry: [raise('CLEAR')],
          on: {
            EVENT_OUTER1_A: 'A',
            EVENT_OUTER1_B: 'B'
          }
        }
      }
    },
    OUTER2: {
      type: 'parallel',
      states: {
        INNER1: {
          initial: 'ON',
          states: {
            OFF: {
              on: {
                TURN_ON: 'ON'
              }
            },
            ON: {
              on: {
                CLEAR: 'OFF'
              }
            }
          }
        },
        INNER2: {
          initial: 'OFF',
          states: {
            OFF: {
              on: {
                TURN_ON: 'ON'
              }
            },
            ON: {
              on: {
                TURN_OFF: 'OFF'
              }
            }
          }
        }
      }
    }
  }
});

const nestedParallelState = Machine({
  type: 'parallel',
  states: {
    OUTER1: {
      initial: 'STATE_OFF',
      states: {
        STATE_OFF: {
          on: {
            EVENT_COMPLEX: 'STATE_ON',
            EVENT_SIMPLE: 'STATE_ON'
          }
        },
        STATE_ON: {
          type: 'parallel',
          states: {
            STATE_NTJ0: {
              initial: 'STATE_IDLE_0',
              states: {
                STATE_IDLE_0: {
                  on: {
                    EVENT_STATE_NTJ0_WORK: 'STATE_WORKING_0'
                  }
                },
                STATE_WORKING_0: {
                  on: {
                    EVENT_STATE_NTJ0_IDLE: 'STATE_IDLE_0'
                  }
                }
              }
            },
            STATE_NTJ1: {
              initial: 'STATE_IDLE_1',
              states: {
                STATE_IDLE_1: {
                  on: {
                    EVENT_STATE_NTJ1_WORK: 'STATE_WORKING_1'
                  }
                },
                STATE_WORKING_1: {
                  on: {
                    EVENT_STATE_NTJ1_IDLE: 'STATE_IDLE_1'
                  }
                }
              }
            }
          }
        }
      }
    },
    OUTER2: {
      initial: 'STATE_OFF',
      states: {
        STATE_OFF: {
          on: {
            EVENT_COMPLEX: 'STATE_ON_COMPLEX',
            EVENT_SIMPLE: 'STATE_ON_SIMPLE'
          }
        },
        STATE_ON_SIMPLE: {},
        STATE_ON_COMPLEX: {
          type: 'parallel',
          states: {
            STATE_INNER1: {
              initial: 'STATE_OFF',
              states: {
                STATE_OFF: {},
                STATE_ON: {}
              }
            },
            STATE_INNER2: {
              initial: 'STATE_OFF',
              states: {
                STATE_OFF: {},
                STATE_ON: {}
              }
            }
          }
        }
      }
    }
  }
});

const deepFlatParallelMachine = Machine({
  type: 'parallel',
  states: {
    X: {},
    V: {
      initial: 'A',
      on: {
        a: {
          target: 'V.A'
        },
        b: {
          target: 'V.B'
        },
        c: {
          target: 'V.C'
        }
      },
      states: {
        A: {},
        B: {
          initial: 'BB',
          states: {
            BB: {
              type: 'parallel',
              states: {
                BBB_A: {},
                BBB_B: {}
              }
            }
          }
        },
        C: {}
      }
    }
  }
});

describe('parallel states', () => {
  it('should have initial parallel states', () => {
    const { initialState } = wordMachine;

    assert.deepEqual(initialState.value, {
      bold: 'off',
      italics: 'off',
      underline: 'off',
      list: 'none'
    });
  });

  const expected = {
    'bold.off': {
      TOGGLE_BOLD: {
        bold: 'on',
        italics: 'off',
        underline: 'off',
        list: 'none'
      }
    },
    'bold.on': {
      TOGGLE_BOLD: {
        bold: 'off',
        italics: 'off',
        underline: 'off',
        list: 'none'
      }
    },
    [JSON.stringify({
      bold: 'off',
      italics: 'off',
      underline: 'on',
      list: 'bullets'
    })]: {
      'TOGGLE_BOLD, TOGGLE_ITALICS': {
        bold: 'on',
        italics: 'on',
        underline: 'on',
        list: 'bullets'
      },
      RESET: {
        bold: 'off',
        italics: 'off',
        underline: 'off',
        list: 'none'
      }
    }
  };

  Object.keys(expected).forEach(fromState => {
    Object.keys(expected[fromState]).forEach(eventTypes => {
      const toState = expected[fromState][eventTypes];

      it(`should go from ${fromState} to ${JSON.stringify(
        toState
      )} on ${eventTypes}`, () => {
        const resultState = testMultiTransition(
          wordMachine,
          fromState,
          eventTypes
        );

        assert.deepEqual(resultState.value, toState);
      });
    });
  });

  it('should have all parallel states represented in the state value', () => {
    const nextState = wakMachine.transition(wakMachine.initialState, 'WAK1');

    assert.deepEqual(nextState.value, { wak1: 'wak1sonB', wak2: 'wak2sonA' });
  });

  it('should have all parallel states represented in the state value (2)', () => {
    const nextState = wakMachine.transition(wakMachine.initialState, 'WAK2');

    assert.deepEqual(nextState.value, { wak1: 'wak1sonA', wak2: 'wak2sonB' });
  });

  it('should work with regions without states', () => {
    assert.deepEqual(flatParallelMachine.initialState.value, {
      foo: {},
      bar: {},
      baz: 'one'
    });
  });

  it('should work with regions without states', () => {
    const nextState = flatParallelMachine.transition(
      flatParallelMachine.initialState,
      'E'
    );
    assert.deepEqual(nextState.value, {
      foo: {},
      bar: {},
      baz: 'two'
    });
  });

  it('should properly transition to relative substate', () => {
    const nextState = composerMachine.transition(
      composerMachine.initialState,
      'singleClickActivity'
    );

    assert.deepEqual(nextState.value, {
      ReadOnly: {
        StructureEdit: {
          SelectionStatus: 'SelectedActivity',
          ClipboardStatus: 'Empty'
        }
      }
    });
  });

  it('should properly transition according to onEntry events on an initial state', () => {
    assert.deepEqual(raisingParallelMachine.initialState.value, {
      OUTER1: 'C',
      OUTER2: {
        INNER1: 'OFF',
        INNER2: 'OFF'
      }
    });
  });

  it('should properly transition when raising events for a parallel state', () => {
    const nextState = raisingParallelMachine.transition(
      raisingParallelMachine.initialState,
      'EVENT_OUTER1_B'
    );

    assert.deepEqual(nextState.value, {
      OUTER1: 'B',
      OUTER2: {
        INNER1: 'ON',
        INNER2: 'ON'
      }
    });
  });

  xit('should handle simultaneous orthogonal transitions', () => {
    const simultaneousMachine = Machine<{ value: string }>({
      id: 'yamlEditor',
      type: 'parallel',
      context: {
        value: ''
      },
      states: {
        editing: {
          on: {
            CHANGE: {
              actions: assign({
                value: (_, e) => e.value
              })
            }
          }
        },
        status: {
          initial: 'unsaved',
          states: {
            unsaved: {
              on: {
                SAVE: {
                  target: 'saved',
                  actions: 'save'
                }
              }
            },
            saved: {
              on: {
                CHANGE: 'unsaved'
              }
            }
          }
        }
      }
    });

    const savedState = simultaneousMachine.transition(
      simultaneousMachine.initialState,
      'SAVE'
    );
    const unsavedState = simultaneousMachine.transition(savedState, {
      type: 'CHANGE',
      value: 'something'
    });

    assert.deepEqual(unsavedState.value, {});
  });

  describe('transitions with nested parallel states', () => {
    const initialState = nestedParallelState.initialState;
    const simpleNextState = nestedParallelState.transition(
      initialState,
      'EVENT_SIMPLE'
    );
    const complexNextState = nestedParallelState.transition(
      initialState,
      'EVENT_COMPLEX'
    );

    it('should properly transition when in a simple nested state', () => {
      const nextState = nestedParallelState.transition(
        simpleNextState,
        'EVENT_STATE_NTJ0_WORK'
      );

      assert.deepEqual(nextState.value, {
        OUTER1: {
          STATE_ON: {
            STATE_NTJ0: 'STATE_WORKING_0',
            STATE_NTJ1: 'STATE_IDLE_1'
          }
        },
        OUTER2: 'STATE_ON_SIMPLE'
      });
    });

    it('should properly transition when in a complex nested state', () => {
      const nextState = nestedParallelState.transition(
        complexNextState,
        'EVENT_STATE_NTJ0_WORK'
      );

      assert.deepEqual(nextState.value, {
        OUTER1: {
          STATE_ON: {
            STATE_NTJ0: 'STATE_WORKING_0',
            STATE_NTJ1: 'STATE_IDLE_1'
          }
        },
        OUTER2: {
          STATE_ON_COMPLEX: {
            STATE_INNER1: 'STATE_OFF',
            STATE_INNER2: 'STATE_OFF'
          }
        }
      });
    });
  });

  // https://github.com/davidkpiano/xstate/issues/191
  describe('nested flat parallel states', () => {
    const machine = Machine({
      initial: 'A',
      states: {
        A: {
          on: {
            'to-B': 'B'
          }
        },
        B: {
          type: 'parallel',
          states: {
            C: {},
            D: {}
          }
        }
      },
      on: {
        'to-A': 'A'
      }
    });

    it('should represent the flat nested parallel states in the state value', () => {
      const result = machine.transition(machine.initialState, 'to-B');

      assert.deepEqual(result.value, {
        B: {
          C: {},
          D: {}
        }
      });
    });
  });

  describe('deep flat parallel states', () => {
    it('should properly evaluate deep flat parallel states', () => {
      const state1 = deepFlatParallelMachine.transition(
        deepFlatParallelMachine.initialState,
        'a'
      );
      const state2 = deepFlatParallelMachine.transition(state1, 'c');
      const state3 = deepFlatParallelMachine.transition(state2, 'b');
      assert.deepEqual(state3.value, {
        V: {
          B: {
            BB: {
              BBB_A: {},
              BBB_B: {}
            }
          }
        },
        X: {}
      });
    });

    it('should not overlap resolved state trees in state resolution', () => {
      const machine = Machine({
        id: 'pipeline',
        type: 'parallel',
        states: {
          foo: {
            on: {
              UPDATE: {
                actions: () => {
                  /* do nothing */
                }
              }
            }
          },
          bar: {
            on: {
              UPDATE: '.baz'
            },
            initial: 'idle',
            states: {
              idle: {},
              baz: {}
            }
          }
        }
      });

      assert.doesNotThrow(() => {
        machine.transition(machine.initialState, 'UPDATE');
      });
    });
  });
});
