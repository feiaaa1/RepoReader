import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
    apiKey: string;
    selectedModel: string;
    userProfile: string;
    knowledgeBase: string;
    autoAnalysis: boolean;
    setApiKey: (apiKey: string) => void;
    setSelectedModel: (model: string) => void;
    setUserProfile: (profile: string) => void;
    setKnowledgeBase: (knowledge: string) => void;
    setAutoAnalysis: (autoAnalysis: boolean) => void;
    resetSettings: () => void;
}

const initialState = {
    apiKey: '',
    selectedModel: '',
    userProfile: '',
    knowledgeBase: '',
    autoAnalysis: false,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...initialState,
            setApiKey: (apiKey: string) => set({ apiKey }),
            setSelectedModel: (selectedModel: string) => set({ selectedModel }),
            setUserProfile: (userProfile: string) => set({ userProfile }),
            setKnowledgeBase: (knowledgeBase: string) => set({ knowledgeBase }),
            setAutoAnalysis: (autoAnalysis: boolean) => set({ autoAnalysis }),
            resetSettings: () => set(initialState),
        }),
        {
            name: 'repo-reader-settings',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    return str ? JSON.parse(str) : null;
                },
                setItem: (name, value) => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
        }
    )
);