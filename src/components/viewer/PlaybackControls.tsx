interface PlaybackControlsProps {
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onNextStep: () => void
  onPrevStep: () => void
}

export function PlaybackControls({
  isPlaying,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onStop,
  onNextStep,
  onPrevStep,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-3 bg-gray-900">
      <button
        onClick={onStop}
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
        title="Detener"
      >
        ■
      </button>
      <button
        onClick={onPrevStep}
        disabled={currentStep <= 0}
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center disabled:opacity-30"
        title="Paso anterior"
      >
        ◀◀
      </button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center text-xl"
        title={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <button
        onClick={onNextStep}
        disabled={currentStep >= totalSteps - 1}
        className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center disabled:opacity-30"
        title="Paso siguiente"
      >
        ▶▶
      </button>
      <span className="text-gray-400 text-sm ml-2">
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  )
}
