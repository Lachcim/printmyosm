import { useSyncExternalStore } from "react";

let atlas = null;
let atlasVersion = 0;
const subscribers = new Set();

function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

const getSnapshot = () => atlasVersion;
const notifySubscribers = () => subscribers.forEach(callback => callback());

function setAtlas(newAtlas) {
    if (atlas == newAtlas)
        return;

    atlas = newAtlas;
    atlasVersion = Math.random();

    if (atlas != null) {
        atlas.onChange = () => {
            atlasVersion++;
            notifySubscribers();
        };
    }

    notifySubscribers();
}

export default function useAtlas() {
    useSyncExternalStore(subscribe, getSnapshot);

    return { atlas, setAtlas };
}
