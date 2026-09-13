import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Radio,
  Sliders,
  Check,
  X,
  Volume2,
  Shield,
} from 'lucide-react';
import { AppLanguage, Room, UserRole, Zone } from '../types';
import { translations } from '../lib/i18n';

interface RoomsManagementViewProps {
  currentLang: AppLanguage;
  userRole: UserRole;
  rooms: Room[];
  zones: Zone[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: (room: Partial<Room>) => void;
  onDeleteRoom: (roomId: string) => void;
  onAddZone: (zone: Partial<Zone>) => void;
  onDeleteZone: (zoneId: string) => void;
  onUpdateZone: (zoneId: string, updates: Partial<Zone>) => void;
}

export const RoomsManagementView: React.FC<RoomsManagementViewProps> = ({
  currentLang,
  userRole,
  rooms,
  zones,
  selectedRoomId,
  onSelectRoom,
  onAddRoom,
  onDeleteRoom,
  onAddZone,
  onDeleteZone,
  onUpdateZone,
}) => {
  const t = translations[currentLang];
  const isReadOnly = userRole === 'viewer';
  const isAdmin = userRole === 'admin';

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLocation, setNewRoomLocation] = useState('');
  const [newRoomSpl, setNewRoomSpl] = useState(75);

  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('ZONE E');
  const [newZoneLabel, setNewZoneLabel] = useState('');
  const [newZoneVol, setNewZoneVol] = useState(60);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const currentZones = zones.filter((z) => z.roomId === selectedRoom?.id);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    onAddRoom({
      name: newRoomName.trim(),
      location: newRoomLocation.trim() || 'المبنى الرئيسي',
      masterVolume: 70,
      isMuted: false,
      status: 'online',
      targetSplDb: Number(newRoomSpl) || 75,
    });

    setNewRoomName('');
    setNewRoomLocation('');
    setShowAddRoomModal(false);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !selectedRoom) return;

    onAddZone({
      roomId: selectedRoom.id,
      name: newZoneName.trim().toUpperCase(),
      label: newZoneLabel.trim() || 'منطقة صوتية إضافية',
      volume: Number(newZoneVol) || 60,
      isMuted: false,
      connectionStatus: 'online',
      currentLevelDb: -18,
      peakLevelDb: -8,
      autoMode: true,
      safeMinVol: 15,
      safeMaxVol: 85,
    });

    setNewZoneName(`ZONE ${String.fromCharCode(65 + currentZones.length + 1)}`);
    setNewZoneLabel('');
    setShowAddZoneModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {t.tabRooms}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            {currentLang === 'ar'
              ? 'إنشاء وإدارة القاعات وتوزيع المناطق الصوتية ومحددات الأمان (Gain Limits)'
              : 'Manage audio halls, configure acoustic zones, and calibrate safe volume thresholds.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRoom}</span>
          </button>
        )}
      </div>

      {/* Rooms Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const roomZonesCount = zones.filter((z) => z.roomId === room.id).length;
          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-neutral-900 border-cyan-500 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                  : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-cyan-400 font-semibold">
                  ROOM ID: {room.id.substring(0, 8)}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    room.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {room.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{room.name}</h3>
              <p className="text-xs text-neutral-400 mb-4">{room.location}</p>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                <span className="text-neutral-400">
                  {roomZonesCount} {t.zones}
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  Master: {room.masterVolume}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Room Zones Section */}
      {selectedRoom && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  {currentLang === 'ar' ? `المناطق الصوتية في: ${selectedRoom.name}` : `Audio Zones for: ${selectedRoom.name}`}
                </h3>
              </div>
              <span className="text-xs text-neutral-400">
                {currentZones.length} {t.zones} مُهيأة
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddZoneModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-800/40 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addZone}</span>
              </button>
            )}
          </div>

          {/* Zones Table / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentZones.map((zone) => (
              <div
                key={zone.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-white bg-neutral-800 px-2 py-0.5 rounded">
                      {zone.name}
                    </span>
                    <span className="text-xs font-semibold text-neutral-200">
                      {zone.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        zone.autoMode
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {zone.autoMode ? 'AUTO GAIN' : 'MANUAL'}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteZone(zone.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-900/60 p-3 rounded-lg">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">
                      Safe Volume Window
                    </span>
                    <span className="font-mono text-neutral-200">
                      {zone.safeMinVol}% — {zone.safeMaxVol}%
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">
                      Current Output
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {zone.volume}% ({zone.currentLevelDb} dBFS)
                    </span>
                  </div>
                </div>

                {/* Safe Boundary Settings Toggle */}
                {!isReadOnly && (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                    <span className="text-neutral-400">
                      {currentLang === 'ar' ? 'الموازنة التلقائية للذكاء الاصطناعي:' : 'AI Auto-Gain:'}
                    </span>
                    <button
                      onClick={() => onUpdateZone(zone.id, { autoMode: !zone.autoMode })}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                        zone.autoMode
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {zone.autoMode ? t.autoMode : t.manualMode}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">{t.addRoom}</h3>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">{t.roomName}</label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'ar' ? 'مثال: قاعة المحاضرات ب' : 'e.g. Auditorium B'}
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">{t.location}</label>
                <input
                  type="text"
                  placeholder={currentLang === 'ar' ? 'مثال: الطابق الأرضي' : 'e.g. Ground Floor'}
                  value={newRoomLocation}
                  onChange={(e) => setNewRoomLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">{t.targetSpl}</label>
                <input
                  type="number"
                  min="60"
                  max="95"
                  value={newRoomSpl}
                  onChange={(e) => setNewRoomSpl(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-lg text-xs"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">{t.addZone}</h3>

            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'رمز المنطقة (Zone Code)' : 'Zone Code'}
                </label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white font-mono uppercase focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'اسم / وصف المنطقة' : 'Zone Label / Purpose'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'ar' ? 'مثال: منصة التشريفات' : 'e.g. VIP Terrace'}
                  value={newZoneLabel}
                  onChange={(e) => setNewZoneLabel(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'مستوى الصوت الابتدائي (%)' : 'Initial Volume (%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newZoneVol}
                  onChange={(e) => setNewZoneVol(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-lg text-xs"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
