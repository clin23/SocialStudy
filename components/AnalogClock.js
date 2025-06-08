import React from 'react';

const AnalogClock = ({ timeInSeconds, isPomodoroCountdown = false, pomodoroSegmentTotalSeconds = 60 * 60 }) => {
    let secondsForHand, minutesForHand;
    let secondHandAngle, minuteHandAngle;

    if (isPomodoroCountdown) {
        secondsForHand = timeInSeconds % 60;
        minuteHandAngle = (timeInSeconds / pomodoroSegmentTotalSeconds) * 360;
        secondHandAngle = (secondsForHand / 60) * 360;
    } else {
        secondsForHand = timeInSeconds % 60;
        minutesForHand = Math.floor(timeInSeconds / 60) % 60;
        secondHandAngle = (secondsForHand / 60) * 360;
        minuteHandAngle = ((minutesForHand / 60) * 360) + (secondsForHand / 60) * 6;
    }

    return (
        <svg width="120" height="120" viewBox="0 0 100 100" className="mb-2">
            <circle cx="50" cy="50" r="48" stroke="#4A5568" strokeWidth="2" fill="#374151" />
            {[0, 90, 180, 270].map(angle => (
                <line key={`major-${angle}`} x1="50" y1="5" x2="50" y2="10" stroke="#718096" strokeWidth="1.5" transform={`rotate(${angle}, 50, 50)`}/>
            ))}
            {[30, 60, 120, 150, 210, 240, 300, 330].map(angle => (
                <line key={`minor-${angle}`} x1="50" y1="5" x2="50" y2="8" stroke="#4A5568" strokeWidth="1" transform={`rotate(${angle}, 50, 50)`}/>
            ))}
            <line
                x1="50"
                y1="50"
                x2="50"
                y2="25"
                stroke="#A78BFA"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${minuteHandAngle}, 50, 50)`}
            />
            <line
                x1="50"
                y1="50"
                x2="50"
                y2="15"
                stroke="#FBBF24"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${secondHandAngle}, 50, 50)`}
            />
            <circle cx="50" cy="50" r="3" fill="#A78BFA" />
        </svg>
    );
};

export default AnalogClock;