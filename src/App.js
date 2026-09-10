import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import useInactivity from './hooks/useInactivity';

import backgroundImage from './assets/background.png';
import scaleImage from './assets/scale.png';
import sliderImage from './assets/slider.png';
import allContentImage from './assets/all.png';

const SLIDER_LIMITS = {
  startX: 142,
  endX: 1850,
};

const INACTIVITY_TIMEOUT_MS = 90000;

// Предзагрузка всех изображений
const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      });
    })
  );
};

function App() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [maxScrollPx, setMaxScrollPx] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Функция возврата в начальное положение
  const resetToHome = useCallback(() => {
    console.log('Inactivity timeout: returning to home position (0%)');
    setScrollPercent(0);
  }, []);

  const { resetTimer, stopTimer } = useInactivity(resetToHome, INACTIVITY_TIMEOUT_MS);

  // Функция для обработки активности пользователя
  const handleUserActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Кэширование изображений при монтировании
  useEffect(() => {
    const imageUrls = [backgroundImage, scaleImage, sliderImage, allContentImage];
    preloadImages(imageUrls)
      .then(() => {
        setIsPreloaded(true);
        console.log('All images cached successfully');
      })
      .catch((err) => {
        console.error('Image caching error:', err);
        setIsPreloaded(true);
      });
  }, []);

  // БЛОКИРОВКА ЖЕСТОВ И ОТСЛЕЖИВАНИЕ АКТИВНОСТИ
  useEffect(() => {
    const disableContextMenu = (e) => {
      e.preventDefault();
      handleUserActivity();
      return false;
    };

    const disableTouchGestures = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
      handleUserActivity();
    };

    const disableWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
      handleUserActivity();
    };

    const disableKeyboardShortcuts = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
      if (e.altKey && (e.key === 'Tab' || e.key === 'F4' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F5' || e.key === 'F11' || e.key === 'F12') {
        return true;
      }
      if (e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4' ||
          e.key === 'F6' || e.key === 'F7' || e.key === 'F8' || e.key === 'F9' || e.key === 'F10') {
        e.preventDefault();
        return false;
      }
      handleUserActivity();
    };

    const disableDoubleClick = (e) => {
      e.preventDefault();
      handleUserActivity();
      return false;
    };

    const disableSelection = (e) => {
      e.preventDefault();
      return false;
    };

    // Обработчики для отслеживания активности
    const handleMouseMove = () => handleUserActivity();
    const handleMouseDown = () => handleUserActivity();
    const handleTouchStart = () => handleUserActivity();
    const handleTouchMove = () => handleUserActivity();
    const handleClick = () => handleUserActivity();
    const handleKeyPress = () => handleUserActivity();

    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('touchstart', disableTouchGestures, { passive: false });
    document.addEventListener('touchmove', disableTouchGestures, { passive: false });
    document.addEventListener('wheel', disableWheelZoom, { passive: false });
    document.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('dblclick', disableDoubleClick);
    document.addEventListener('selectstart', disableSelection);
    document.addEventListener('dragstart', disableSelection);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeyPress);
    
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';

    // Запускаем таймер при монтировании
    resetTimer();

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('touchstart', disableTouchGestures);
      document.removeEventListener('touchmove', disableTouchGestures);
      document.removeEventListener('wheel', disableWheelZoom);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('dblclick', disableDoubleClick);
      document.removeEventListener('selectstart', disableSelection);
      document.removeEventListener('dragstart', disableSelection);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keypress', handleKeyPress);
      
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.webkitTouchCallout = '';
      
      stopTimer();
    };
  }, [handleUserActivity, resetTimer, stopTimer]);

  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerWidth = containerRef.current.clientWidth;
      const displayWidth = imgRect.width;
      
      const newMaxScroll = displayWidth - containerWidth;
      setMaxScrollPx(newMaxScroll > 0 ? newMaxScroll : 0);
      
      console.log('Image display width:', displayWidth);
      console.log('Container width:', containerWidth);
      console.log('Max scroll (px):', newMaxScroll);
    }
  };

  const getScrollPxFromPercent = (percent) => {
    if (maxScrollPx === 0) return 0;
    return (percent / 100) * maxScrollPx;
  };

  const getSliderPositionPercent = (scrollPercentValue) => {
    return scrollPercentValue;
  };

  const getScrollPercentFromSliderPercent = (sliderPercentValue) => {
    return sliderPercentValue;
  };

  const handleSliderChange = (e) => {
    const sliderPercentValue = parseInt(e.target.value, 10);
    const newScrollPercent = getScrollPercentFromSliderPercent(sliderPercentValue);
    setScrollPercent(Math.min(Math.max(newScrollPercent, 0), 100));
    handleUserActivity();
  };

  const sliderPercent = getSliderPositionPercent(scrollPercent);
  const scrollPx = getScrollPxFromPercent(scrollPercent);

  // Пока картинки кэшируются, показываем фон
  if (!isPreloaded) {
    return (
      <div className="app-container">
        <div 
          className="background"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div 
        className="background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      <div className="content-container" ref={containerRef}>
        <div className="scroll-wrapper">
          <div 
            className="scroll-content" 
            style={{ transform: `translateX(-${scrollPx}px)` }}
          >
            <img 
              ref={imageRef}
              src={allContentImage} 
              alt="all content"
              className="all-image"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              onLoad={handleImageLoad}
            />
          </div>
        </div>
      </div>

      <div className="bottom-panel">
        <div className="scale-container">
          <img 
            src={scaleImage} 
            alt="scale" 
            className="scale-image"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
          />
          
          <div className="slider-wrapper">
            <img 
              src={sliderImage} 
              alt="slider" 
              className="slider-knob" 
              style={{
                left: `${SLIDER_LIMITS.startX + (sliderPercent / 100) * (SLIDER_LIMITS.endX - SLIDER_LIMITS.startX)}px`
              }}
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={sliderPercent}
              onChange={handleSliderChange}
              className="hidden-slider"
              style={{
                left: `${SLIDER_LIMITS.startX}px`,
                width: `${SLIDER_LIMITS.endX - SLIDER_LIMITS.startX}px`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;