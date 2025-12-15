import React, { useState, useEffect, useRef } from 'react';
import { Send, Map as MapIcon, Compass, Shield, AlertCircle } from 'lucide-react';
import { AdventureMap, GameStateData, GameRoom } from '../types';
import { generateAdventureMap, resolveAdventureAction } from '../services/geminiService';
import Spinner from './Spinner';

interface Props {
  initialTheme?: string;
}

const AdventureGame: React.FC<Props> = ({ initialTheme }) => {
  // Game Data
  const [map, setMap] = useState<AdventureMap | null>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameStateData>({
    currentRoomId: '',
    inventory: [],
    history: [],
    visitedRoomIds: [],
    isGameOver: false
  });

  // UI State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Game
  useEffect(() => {
    const initGame = async () => {
      setIsInitializing(true);
      try {
        const theme = initialTheme || "Healing the Inner Child";
        const newMap = await generateAdventureMap(theme);
        setMap(newMap);
        setGameState({
          currentRoomId: newMap.startingRoomId,
          inventory: [],
          history: [{ type: 'system', text: newMap.intro }],
          visitedRoomIds: [newMap.startingRoomId],
          isGameOver: false
        });
      } catch (error) {
        console.error(error);
        setGameState(prev => ({
          ...prev,
          history: [...prev.history, { type: 'error', text: "Error generating the spirit map. Please try again." }]
        }));
      } finally {
        setIsInitializing(false);
      }
    };
    initGame();
  }, [initialTheme]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.history]);

  const getCurrentRoom = (): GameRoom | undefined => {
    return map?.rooms.find(r => r.id === gameState.currentRoomId);
  };

  const handleCommand = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !map) return;

    const cmd = input.trim().toLowerCase();
    const currentRoom = getCurrentRoom();
    
    if (!currentRoom) return;

    // Update history with user command
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, { type: 'user', text: input }]
    }));
    setInput('');
    setIsLoading(true);

    try {
      // 1. Handle Movement (Client-side logic for consistency)
      const directions = ['north', 'south', 'east', 'west'];
      if (directions.includes(cmd) || cmd.startsWith('go ')) {
        const dir = cmd.replace('go ', '').trim();
        const nextRoomId = currentRoom.exits[dir];

        if (nextRoomId) {
          setGameState(prev => ({
            ...prev,
            currentRoomId: nextRoomId,
            visitedRoomIds: [...new Set([...prev.visitedRoomIds, nextRoomId])],
            history: [...prev.history, { type: 'user', text: input }] // Adding user input is handled above, but for flow:
          }));
          // Note: The new room description will be rendered by the UI, we don't need to push it to history explicitly unless we want a log.
          // Let's keep the history strictly for "Events". The UI displays current room static description.
        } else {
          setGameState(prev => ({
            ...prev,
            history: [...prev.history, { type: 'system', text: "You cannot go that way." }]
          }));
        }
        setIsLoading(false);
        return;
      }

      // 2. Handle Item Pickup
      if (cmd.includes('take') || cmd.includes('get') || cmd.includes('pick')) {
         if (currentRoom.item && cmd.includes(currentRoom.item.toLowerCase())) {
            setGameState(prev => ({
               ...prev,
               inventory: [...prev.inventory, currentRoom.item!],
               history: [...prev.history, { type: 'system', text: `You acquired: ${currentRoom.item}. You feel a shift in energy.` }]
            }));
            // Remove item from room locally to prevent duplicate pickup (optional, simplified here)
         } else {
            setGameState(prev => ({
               ...prev,
               history: [...prev.history, { type: 'system', text: "There is nothing like that here to take." }]
            }));
         }
         setIsLoading(false);
         return;
      }

      // 3. Handle Look
      if (cmd === 'look' || cmd === 'examine') {
        // Just re-display description in history if needed, or do nothing as it is always visible.
        // Let's ask AI for deeper detail.
        const narrative = await resolveAdventureAction(
          cmd, 
          currentRoom.description, 
          gameState.inventory, 
          currentRoom.encounter
        );
        setGameState(prev => ({
           ...prev,
           history: [...prev.history, { type: 'system', text: narrative }]
        }));
        setIsLoading(false);
        return;
      }

      // 4. Handle Complex Actions / Combat / Usage via Gemini
      const narrative = await resolveAdventureAction(
        input, 
        currentRoom.description, 
        gameState.inventory, 
        currentRoom.encounter
      );
      
      setGameState(prev => ({
        ...prev,
        history: [...prev.history, { type: 'system', text: narrative }]
      }));

    } catch (err) {
       setGameState(prev => ({
        ...prev,
        history: [...prev.history, { type: 'error', text: "The connection to the ethereal plane wavered." }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-ki-dark">
        <Spinner />
        <p className="font-serif text-lg animate-pulse">Generando la topografía de tu subconsciente...</p>
      </div>
    );
  }

  const currentRoom = getCurrentRoom();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      
      {/* Main Game Window */}
      <div className="lg:col-span-2 flex flex-col bg-gray-900 text-green-400 font-mono rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        
        {/* Header - Current Location */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <Compass size={18} />
             <span className="font-bold uppercase tracking-wider">{currentRoom?.name || "Unknown Void"}</span>
           </div>
           <div className="text-xs text-gray-500">Holistic Terminal v1.0</div>
        </div>

        {/* Scrollable Output */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4" ref={scrollRef}>
          {/* Intro if start */}
          {gameState.history.length === 1 && (
             <div className="text-ki-teal mb-6 italic border-l-2 border-ki-teal pl-4">
               {map?.intro}
             </div>
          )}

          {/* Current Room Description Always Visible at top of context effectively? 
              Actually standard IF games show history. We should render the current room description as the latest 'context' block. 
          */}
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-4">
             <p className="text-white leading-relaxed">{currentRoom?.description}</p>
             
             {currentRoom?.item && !gameState.inventory.includes(currentRoom.item) && (
               <div className="mt-2 text-yellow-300 flex items-center gap-2">
                 <SparklesIcon /> You see a {currentRoom.item} here.
               </div>
             )}
             
             {currentRoom?.encounter && (
               <div className="mt-2 text-red-400 flex items-center gap-2 font-bold animate-pulse">
                 <AlertCircle size={16} /> Blockage Detected: {currentRoom.encounter}
               </div>
             )}

             <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2 text-sm text-gray-400">
               Exits: 
               {Object.keys(currentRoom?.exits || {}).map(dir => (
                 <span key={dir} className="px-2 py-0.5 bg-gray-700 rounded text-white uppercase">{dir}</span>
               ))}
             </div>
          </div>

          {/* Log History */}
          {gameState.history.slice(1).map((entry, idx) => (
            <div key={idx} className={`
              ${entry.type === 'user' ? 'text-right text-gray-400 italic' : ''}
              ${entry.type === 'error' ? 'text-red-500' : ''}
              ${entry.type === 'system' ? 'text-green-300' : ''}
            `}>
               {entry.type === 'user' ? `> ${entry.text}` : entry.text}
            </div>
          ))}

          {isLoading && <div className="text-ki-teal animate-pulse">... KiFusion is processing ...</div>}
        </div>

        {/* Input Area */}
        <form onSubmit={handleCommand} className="bg-gray-800 p-4 border-t border-gray-700 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you want to do? (e.g., 'go north', 'take crystal', 'heal trauma')"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 font-mono"
            autoFocus
          />
          <button type="submit" disabled={isLoading} className="text-ki-teal hover:text-white transition-colors">
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Side Panel: Inventory & Status */}
      <div className="space-y-6">
         {/* Inventory */}
         <div className="glass-panel p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-serif font-bold text-ki-dark mb-4 flex items-center gap-2">
               <Shield size={18} className="text-ki-purple" />
               Inventory / Tools
            </h3>
            {gameState.inventory.length === 0 ? (
               <p className="text-gray-400 italic text-sm">You are carrying no tools.</p>
            ) : (
               <ul className="space-y-2">
                  {gameState.inventory.map((item, i) => (
                     <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-ki-gold"></span>
                        {item}
                     </li>
                  ))}
               </ul>
            )}
         </div>

         {/* Mini Map Visualization (Procedural) */}
         <div className="glass-panel p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-serif font-bold text-ki-dark mb-4 flex items-center gap-2">
               <MapIcon size={18} className="text-ki-teal" />
               Mental Map
            </h3>
            <div className="bg-white/50 p-4 rounded-lg min-h-[150px] flex items-center justify-center text-xs text-gray-500">
               {/* Simple visualization of visited rooms count */}
               <div className="text-center">
                  <div className="text-3xl font-bold text-ki-purple mb-1">
                     {gameState.visitedRoomIds.length} / {map?.rooms.length}
                  </div>
                  <p>Regions Explored</p>
                  <p className="mt-2 italic opacity-75">
                     "{map?.title}"
                  </p>
               </div>
            </div>
         </div>
         
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
            <p className="font-bold mb-1">How to play:</p>
            <ul className="list-disc pl-4 space-y-1 opacity-80">
               <li>Type <strong>north, south, east, west</strong> to move.</li>
               <li>Type <strong>take [item]</strong> to pick up insights.</li>
               <li>Describe actions like <strong>"use kinesiology on shadow"</strong> to solve puzzles.</li>
            </ul>
         </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
   </svg>
);

export default AdventureGame;
