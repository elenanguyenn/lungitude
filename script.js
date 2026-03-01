'use strict';

const APP_CONFIG = {
    MIN_SCREEN: 1,
    MAX_SCREEN: 11,
    ANIMATION_DURATION: 300,
    ANIMATION_EASING: 'ease-out'
};

let currentScreen = 1;
let usernameTouched = false;
let passwordTouched = false;

function showScreen(n) {
    if (n === currentScreen || n < APP_CONFIG.MIN_SCREEN || n > APP_CONFIG.MAX_SCREEN) return;
    
    const curEl = document.getElementById(String(currentScreen));
    const nextEl = document.getElementById(String(n));
    
    if (!nextEl) return;

    const forward = n > currentScreen;
    
    // Prepare next screen
    nextEl.style.transition = 'none';
    nextEl.style.transform = `translateX(${forward ? 100 : -100}%)`;
    nextEl.style.opacity = '1';
    nextEl.classList.add('active');
    nextEl.style.zIndex = '2';
    
    // Force reflow
    void nextEl.offsetWidth;
    
    const duration = `${APP_CONFIG.ANIMATION_DURATION}ms`;
    const easing = APP_CONFIG.ANIMATION_EASING;
    
    if (curEl) {
        // Slide out current screen completely
        curEl.style.transition = `transform ${duration} ${easing}`;
        curEl.style.transform = `translateX(${forward ? -100 : 100}%)`;
        curEl.style.zIndex = '1';
    }
    
    // Slide in next screen
    nextEl.style.transition = `transform ${duration} ${easing}`;
    nextEl.style.transform = 'translateX(0)';

    const onEnd = () => {
        if (curEl) { 
            curEl.classList.remove('active'); 
            curEl.style.transform = ''; 
            curEl.style.transition = ''; 
            curEl.style.zIndex = '';
        }
        nextEl.style.transform = ''; 
        nextEl.style.transition = '';
        nextEl.style.zIndex = '';
        nextEl.removeEventListener('transitionend', onEnd);
    };
    nextEl.addEventListener('transitionend', onEnd);
    
    currentScreen = n;
    
    if (n === 11) {
        setTimeout(() => initLungQuizzes(), 100);
    }
    
    if (n === 8 && typeof initializeRealScreen8 === 'function') {
        setTimeout(() => initializeRealScreen8(), 100);
    }
}

function nextScreen() { 
    if (currentScreen < APP_CONFIG.MAX_SCREEN) showScreen(currentScreen + 1); 
}

function prevScreen() { 
    if (currentScreen > APP_CONFIG.MIN_SCREEN) showScreen(currentScreen - 1); 
}

function checkPasswordAndGoToScreen4() {
    const passwordInput = document.getElementById('passwordBtn2');
    if (passwordInput && passwordInput.value.trim() !== '') {
        showScreen(4);
    } else {
        alert('You must enter a password.');
    }
}

function initLungQuizzes() {
    const quizData = {
        1: { correct: 'B', feedback: 'Correct! PM2.5 penetrates deepest into lung tissue.' },
        2: { correct: 'B', feedback: 'Correct! Oxidative stress causes cellular damage from toxins.' }
    };
    
    function revealSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                section.style.pointerEvents = 'auto';
            }, 500);
        }
    }
    
    document.querySelectorAll('.quiz-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quizNum = this.dataset.quiz;
            const answer = this.dataset.answer;
            const quiz = document.getElementById(`quiz${quizNum}`);
            const feedback = document.getElementById(`feedback${quizNum}`);
            
            if (quiz.dataset.answered) return;
            quiz.dataset.answered = 'true';
            
            const allBtns = quiz.querySelectorAll('.quiz-btn');
            allBtns.forEach(b => {
                b.style.backgroundColor = '#1a1a7c';
                b.style.borderColor = '#4fc3f7';
                b.disabled = true;
            });
            
            if (answer === quizData[quizNum].correct) {
                this.style.backgroundColor = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                this.style.boxShadow = '0 0 15px #4CAF50';
                feedback.style.color = '#4CAF50';
                feedback.textContent = quizData[quizNum].feedback;
            } else {
                this.style.backgroundColor = '#F44336';
                this.style.borderColor = '#F44336';
                this.style.boxShadow = '0 0 15px #F44336';
                
                allBtns.forEach(b => {
                    if (b.dataset.answer === quizData[quizNum].correct) {
                        b.style.backgroundColor = '#4CAF50';
                        b.style.borderColor = '#4CAF50';
                        b.style.boxShadow = '0 0 15px #4CAF50';
                    }
                });
                
                feedback.style.color = '#F44336';
                feedback.textContent = `Incorrect. The correct answer is ${quizData[quizNum].correct}.`;
            }
            
            feedback.style.display = 'block';
            
            if (quizNum === '1') {
                revealSection('section2');
                setTimeout(() => revealSection('quiz2'), 300);
            } else if (quizNum === '2') {
                revealSection('section3');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const proxyButtons = document.querySelectorAll('.input-proxy');
    proxyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                targetInput.focus();
            }
        });
    });

    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');

    if (usernameInput) {
        usernameInput.addEventListener('focus', () => { usernameTouched = true; });
    }

    if (passwordInput) {
        passwordInput.addEventListener('focus', () => { passwordTouched = true; });
    }
    
    setTimeout(() => {
        const overlay = document.getElementById('fadeOverlay');
        if (overlay) overlay.style.opacity = '0';
    }, 600);
    
    setTimeout(() => {
        const overlay = document.getElementById('fadeOverlay');
        if (overlay) overlay.style.display = 'none';
    }, 2200);
});
