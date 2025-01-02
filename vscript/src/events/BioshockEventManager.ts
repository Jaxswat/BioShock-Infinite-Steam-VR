import { BioshockBaseEvent, BioshockEvent } from "./BioshockEvents";

/**
 * The great big explanation of why we use "difficulty_changed" for all events:
 * 
 * CustomGameEventManager is broken.
 * custom_events.txt is broken.
 * 
 * If I can't add my own events, then there is no good way
 * to do decent networked event driven game logic.
 * 
 * It is possible to load your own events by adding
 * a file at resource/game.gameevents, however these are
 * only loaded in development, not for published workshop items.
 * 
 * There are 90+ "core" events (from the engine), and
 * around 3 "game" events in SteamVR Home.
 * 
 * I am able to call FireGameEvent, FireGameEventLocal, ListenToGameEvent using
 * any of those existing events.
 * 
 * After reviewing core events, I found that "difficulty_changed" satisfies my requirements:
 * 1. The event is not critical for game/engine operation (unlike player_connected, etc.)
 * 2. The event data must have a small data type for the user, since
 *    most events require a userID.
 * 3. The event data must have a small data type for the event type, since there is overhead in
 *    registering multiple listeners for the same event name. A numeric type
 *    allows for quick table matching/filtering for event listeners.
 * 4. The event data must have a string field, for sending
 *    arbitrary data in a string-encoded fashion.
 * 
 * In conclusion, we use one game event but the payload transforms it into
 * a capable wrapper for implementing custom networked game events. Woo.
 */
const GLOBAL_EVENT_NAME = "difficulty_changed";
/**
 * Event structure for difficulty_changed, which we re-use for arbitrary event structuring
 * 	Original core.gameevents definition:
 * 
	"difficulty_changed"
	{
		"newDifficulty"	"short"
		"oldDifficulty"	"short"
		"strDifficulty" "string" // new difficulty as string
	}
 */
interface GlobalEventData {
	newDifficulty: number; // userID    (short)
	oldDifficulty: number; // eventType (short)
	strDifficulty: string; // eventData (string)
}

type baseEventSerializeFn = (data: BioshockBaseEvent) => string;
type baseEventDeserializeFn = (data: BioshockBaseEvent, eventDataStr: string) => void;

export type EventSerializeFn<T extends BioshockBaseEvent> = (data: T) => string;
export type EventDeserializeFn<T extends BioshockBaseEvent> = (data: T, eventDataStr: string) => void;

export type SerializerMap = { [key in BioshockEvent]?: EventSerializeFn<BioshockBaseEvent>; };
export type DeserializerMap = { [key in BioshockEvent]?: EventDeserializeFn<BioshockBaseEvent>; };

export type HandlerFn = (scope: any, data: BioshockBaseEvent) => void;

class BioshockEventManager {
	private eventSerializers: SerializerMap;
	private eventDeserializers: DeserializerMap;

	constructor() {
		this.eventSerializers = {};
		this.eventDeserializers = {};
	}

	public registerEventSerializer<T extends BioshockBaseEvent>(event: BioshockEvent, serializer: EventSerializeFn<T>, deserializer: EventDeserializeFn<T>) {
		this.eventSerializers[event] = serializer as baseEventSerializeFn;
		this.eventDeserializers[event] = deserializer as baseEventDeserializeFn;
		print("[BioshockEventManager] registered serializers for event type ", event);
	}

	public on(registeredEventType: BioshockEvent, handlerFn: HandlerFn, scope: any): number {
		const eventDeserializers = this.eventDeserializers;

		function deserializationWrapper(_: any, eventData: GlobalEventData) {
			const eventType = eventData.oldDifficulty as BioshockEvent;
			if (eventType !== registeredEventType) {
				return;
			}

			const deserialize = eventDeserializers[eventType];
			if (!deserialize) {
				print("[BioshockEventManager] no deserializer registered for event type:", eventType)
				return;
			}

			const userID = eventData.newDifficulty;
			const data: BioshockBaseEvent = { userID };

			const eventDataStr = eventData.strDifficulty;
			try {
				deserialize(data, eventDataStr);
			} catch (err) {
				print("[BioshockEventManager] Error deserializing event: (userID:", userID, ", event:", eventType, ", data:", eventDataStr,")", ":", err);
				return;
			}

			data.player = GetPlayerFromUserID(data.userID);

			handlerFn(scope, data);

			// print("[BioshockEventManager | DEBUG] received event", eventType);
		}

		return ListenToGameEvent(GLOBAL_EVENT_NAME, deserializationWrapper, this);
	}

	private _emit(eventType: BioshockEvent, data: BioshockBaseEvent, local: boolean) {
		const serialize = this.eventSerializers[eventType];
		if (!serialize) {
			print("[BioshockEventManager] no serializer registered for event type:", eventType)
			return null;
		}

		const eventDataStr = serialize(data);
		const eventData: GlobalEventData = {
			newDifficulty: data.userID,
			oldDifficulty: eventType as number,
			strDifficulty: eventDataStr
		};

		if (local) {
			// print("[BioshockEventManager | DEBUG] emit local event", eventType);
			FireGameEventLocal(GLOBAL_EVENT_NAME, eventData);
		} else {
			// print("[BioshockEventManager | DEBUG] emit event", eventType);
			FireGameEvent(GLOBAL_EVENT_NAME, eventData);
		}
	}

	public emit<T extends BioshockBaseEvent>(eventType: BioshockEvent, data: T) {
		this._emit(eventType, data, false);
	}

	public emitLocal<T extends BioshockBaseEvent>(eventType: BioshockEvent, data: T) {
		this._emit(eventType, data, true);
	}
}

export default new BioshockEventManager();
