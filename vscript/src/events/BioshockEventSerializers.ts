import bioshockEventManager from "./BioshockEventManager";
import { BioshockEvent, FairGameStartEvent, FairGameTargetDestroyedEvent, LizGunPointEvent, LizObjectCaughtEvent, LizPlayerReadyEvent } from "./BioshockEvents";
import { splitEventDataIntoNumbers } from "./BioshockEventUtils";

bioshockEventManager.registerEventSerializer<FairGameStartEvent>(BioshockEvent.FairGameStart,
	(data) => {
		return "" + data.gameID;
	},
	(data, eventDataStr: string) => {
		data.gameID = parseInt(eventDataStr, 10);
	}
);
bioshockEventManager.registerEventSerializer<FairGameTargetDestroyedEvent>(BioshockEvent.FairGameTargetDestroyed,
	(data) => {
		return "" + data.gameID + "," + data.entID;
	},
	(data, eventDataStr: string) => {
		const parts = splitEventDataIntoNumbers(eventDataStr);
		data.gameID = parts[0];
		data.entID = parts[1];
	}
);

bioshockEventManager.registerEventSerializer<LizPlayerReadyEvent>(BioshockEvent.LizPlayerReady,
	(data) => {
		return "";
	},
	(data, eventDataStr: string) => {
	}
);
bioshockEventManager.registerEventSerializer<LizObjectCaughtEvent>(BioshockEvent.LizObjectCaught,
	(data) => {
		return "" + data.entID;
	},
	(data, eventDataStr: string) => {
		data.entID = parseInt(eventDataStr, 10);
	}
);
bioshockEventManager.registerEventSerializer<LizGunPointEvent>(BioshockEvent.LizGunPoint,
	(data) => {
		return "";
	},
	(data, eventDataStr: string) => {
	}
);
