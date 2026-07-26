import type {
  GameOneHostAdapter,
  GameOneRemoteSave,
  GameOneSaveRequest,
} from "@readirect/game-one";

export function createGameOneStandaloneHostAdapter(): GameOneHostAdapter {
  let currentSave: GameOneRemoteSave | null = null;

  return {
    async load() {
      return currentSave;
    },

    async save(request: GameOneSaveRequest) {
      assertCurrentRevision(request.expectedRevision, currentSave);
      currentSave = {
        checkpointKey: request.checkpointKey,
        saveSchemaVersion: request.saveSchemaVersion,
        state: request.state,
        revision: request.expectedRevision + 1,
        savedAt: new Date().toISOString(),
      };

      return currentSave;
    },

    async reset(expectedRevision: number) {
      assertCurrentRevision(expectedRevision, currentSave);
      currentSave = null;
    },
  };
}

function assertCurrentRevision(
  expectedRevision: number,
  currentSave: GameOneRemoteSave | null,
): void {
  const currentRevision = currentSave?.revision ?? 0;
  if (expectedRevision !== currentRevision) {
    throw new Error(
      "Standalone progress changed unexpectedly. Reload the game to continue.",
    );
  }
}
