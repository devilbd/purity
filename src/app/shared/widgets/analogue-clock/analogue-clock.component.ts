import { Component, signal, effect, inject, ViewChild } from '@purity/core';
import { ThemeService } from '@data/theme.service';
import './analogue-clock.component.scss';

export interface ClockOptions {
    size?: number;
    title?: string;
    timezone?: string;
    smoothSeconds?: boolean;
    showSeconds?: boolean;
    showNumbers?: boolean;
    showDateBadge?: boolean;
}

@Component({
    selector: 'analogue-clock',
    templateUrl: './src/app/shared/widgets/analogue-clock/analogue-clock.component.html',
})
export class AnalogueClockComponent {
    private themeService = inject(ThemeService);

    @ViewChild('#clock-canvas-el')
    private canvasEl?: HTMLCanvasElement | null;

    // Reactive State Signals
    public size = signal<number>(280);
    public title = signal<string>('Purity Chrono');
    public timezone = signal<string>('local');
    public smoothSeconds = signal<boolean>(true);
    public showSeconds = signal<boolean>(true);
    public showNumbers = signal<boolean>(true);
    public showDateBadge = signal<boolean>(true);

    public digitalTime = signal<string>('00:00:00');
    public dateString = signal<string>('');
    public timezoneLabel = signal<string>('Local Time');

    private animationFrameId: number | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    protected onInit(): void {
        // Reactively re-render whenever theme or visual settings change
        effect(() => {
            this.themeService.isDark();
            this.smoothSeconds();
            this.showSeconds();
            this.showNumbers();
            this.showDateBadge();
            this.timezone();
            this.size();

            this.updateLabels();
            this.initCanvas();
        });

        // Initialize canvas and start smooth animation loop
        this.initCanvas();
        this.startClockLoop();
    }

    public onDestroy(): void {
        this.stopClockLoop();
    }

    public disconnectedCallback(): void {
        this.stopClockLoop();
    }

    private initCanvas(): void {
        const canvas = this.canvasEl || (document.querySelector('#clock-canvas-el') as HTMLCanvasElement | null);
        if (!canvas) return;

        const size = this.size();
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        this.ctx = canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
            this.ctx.scale(dpr, dpr);
        }
    }

    private startClockLoop(): void {
        this.stopClockLoop();

        const tick = () => {
            this.renderClock();
            this.animationFrameId = requestAnimationFrame(tick);
        };

        this.animationFrameId = requestAnimationFrame(tick);
    }

    private stopClockLoop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private getTimeData() {
        const now = new Date();
        let target = now;
        const tz = this.timezone();

        if (tz !== 'local') {
            try {
                const tzStr = now.toLocaleString('en-US', { timeZone: tz });
                target = new Date(tzStr);
            } catch {
                target = now;
            }
        }

        const hours = target.getHours();
        const minutes = target.getMinutes();
        const seconds = target.getSeconds();
        const millis = target.getMilliseconds();

        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        const digitalStr = `${hh}:${mm}:${ss}`;

        const dayName = target.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const monthName = target.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const dayNum = target.getDate();
        const dateStr = `${dayName}, ${monthName} ${dayNum}`;

        return {
            hours,
            minutes,
            seconds,
            millis,
            digitalStr,
            dateStr,
            dayName,
            dayNum,
        };
    }

    private updateLabels(): void {
        const tz = this.timezone();
        if (tz === 'local') {
            this.timezoneLabel.set('Local Time');
        } else if (tz === 'UTC') {
            this.timezoneLabel.set('UTC / GMT');
        } else {
            const cityName = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
            this.timezoneLabel.set(cityName);
        }
    }

    /**
     * Master Canvas Rendering Engine
     */
    private renderClock(): void {
        const canvas = this.canvasEl || (document.querySelector('#clock-canvas-el') as HTMLCanvasElement | null);
        if (!canvas) return;

        if (!this.ctx) {
            this.initCanvas();
            if (!this.ctx) return;
        }

        const ctx = this.ctx;
        const size = this.size();
        const cx = size / 2;
        const cy = size / 2;
        const R = size * 0.44; // dial radius
        const isDark = this.themeService.isDark();

        const time = this.getTimeData();

        // Update reactive signals for template digital readout
        this.digitalTime.set(time.digitalStr);
        this.dateString.set(time.dateStr);

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // 1. Draw Outer Glassmorphic & Metallic Bezel
        this.drawBezel(ctx, cx, cy, R, isDark);

        // 2. Draw Dial Face with Frosted Glass Gradients & Texture
        this.drawDialFace(ctx, cx, cy, R, isDark);

        // 3. Draw Date Aperture Window
        if (this.showDateBadge()) {
            this.drawDateAperture(ctx, cx, cy, R, time.dayName, time.dayNum, isDark);
        }

        // 4. Draw Hour Markers, Cardinal Diamond Accents, and Minute Ticks
        this.drawMarkersAndTicks(ctx, cx, cy, R, isDark);

        // 5. Draw Dial Numerals (12, 3, 6, 9)
        if (this.showNumbers()) {
            this.drawNumerals(ctx, cx, cy, R, isDark);
        }

        // 6. Draw Convex Watch Crystal Specular Gloss Reflection
        this.drawGlassReflection(ctx, cx, cy, R, isDark);

        // 7. Calculate Hand Angles
        const isSmooth = this.smoothSeconds();
        const secFraction = isSmooth ? (time.seconds + time.millis / 1000) : time.seconds;
        const minFraction = time.minutes + secFraction / 60;
        const hourFraction = (time.hours % 12) + minFraction / 60;

        const hourAngle = hourFraction * (Math.PI / 6) - Math.PI / 2;
        const minAngle = minFraction * (Math.PI / 30) - Math.PI / 2;
        const secAngle = secFraction * (Math.PI / 30) - Math.PI / 2;

        // 8. Draw 3D Beveled Hour Hand
        this.drawHourHand(ctx, cx, cy, R, hourAngle, isDark);

        // 9. Draw 3D Beveled Minute Hand
        this.drawMinuteHand(ctx, cx, cy, R, minAngle, isDark);

        // 10. Draw Second Hand with Needle & Counterbalance
        if (this.showSeconds()) {
            this.drawSecondHand(ctx, cx, cy, R, secAngle, isDark);
        }

        // 11. Draw Metallic Center Pivot Cap & Jewel
        this.drawCenterPivot(ctx, cx, cy, size, isDark);
    }

    /**
     * Outer Metallic & Glass Bezel Rim
     */
    private drawBezel(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, isDark: boolean): void {
        const bezelWidth = R * 0.14;
        const outerR = R + bezelWidth;

        ctx.save();

        // Ambient Outer Drop Shadow
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = isDark ? 28 : 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = isDark ? 12 : 8;
        ctx.fillStyle = isDark ? '#1a1d26' : '#e6ebf2';
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // Multi-Stop Bezel Metallic Gradient
        const bezelGrad = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
        if (isDark) {
            bezelGrad.addColorStop(0.0, 'rgba(85, 95, 115, 0.9)');
            bezelGrad.addColorStop(0.25, 'rgba(40, 45, 58, 0.95)');
            bezelGrad.addColorStop(0.5, 'rgba(75, 85, 105, 0.85)');
            bezelGrad.addColorStop(0.75, 'rgba(30, 34, 44, 0.98)');
            bezelGrad.addColorStop(1.0, 'rgba(95, 108, 130, 0.9)');
        } else {
            bezelGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
            bezelGrad.addColorStop(0.25, 'rgba(215, 222, 232, 0.95)');
            bezelGrad.addColorStop(0.5, 'rgba(245, 248, 252, 0.98)');
            bezelGrad.addColorStop(0.75, 'rgba(205, 214, 226, 0.95)');
            bezelGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.98)');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fillStyle = bezelGrad;
        ctx.fill();

        // Crisp Outer Rim Highlight
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner Chamfer Groove Border
        ctx.beginPath();
        ctx.arc(cx, cy, R + 1, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Dial Face with Deep Frosted Glassmorphism
     */
    private drawDialFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, isDark: boolean): void {
        ctx.save();

        // Radial Glass Gradient
        const dialGrad = ctx.createRadialGradient(cx, cy * 0.9, R * 0.1, cx, cy, R);
        if (isDark) {
            dialGrad.addColorStop(0.0, 'rgba(34, 38, 52, 0.96)');
            dialGrad.addColorStop(0.65, 'rgba(22, 25, 36, 0.98)');
            dialGrad.addColorStop(1.0, 'rgba(14, 16, 24, 1.0)');
        } else {
            dialGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.98)');
            dialGrad.addColorStop(0.65, 'rgba(244, 247, 252, 0.96)');
            dialGrad.addColorStop(1.0, 'rgba(230, 236, 246, 0.98)');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = dialGrad;
        ctx.fill();

        // Inset Rim Shadow
        ctx.beginPath();
        ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Concentric Decorative Precision Rings
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.83, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.54, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.035)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Purity Branding Monogram
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.38)';
        ctx.letterSpacing = '2px';
        ctx.fillText('PURITY', cx, cy - R * 0.34);

        ctx.font = '500 7px "Adwaita Mono", monospace';
        ctx.fillStyle = isDark ? 'rgba(53, 132, 228, 0.75)' : 'rgba(28, 113, 216, 0.85)';
        ctx.fillText('AUTOMATIC', cx, cy - R * 0.24);

        ctx.restore();
    }

    /**
     * Date Aperture Window at 3 o'clock
     */
    private drawDateAperture(
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        R: number,
        dayName: string,
        dayNum: number,
        isDark: boolean,
    ): void {
        ctx.save();

        const boxW = R * 0.44;
        const boxH = R * 0.16;
        const boxX = cx + R * 0.28;
        const boxY = cy - boxH / 2;
        const radius = 4;

        // Aperture Background & Inset Border
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, radius);
        ctx.fillStyle = isDark ? 'rgba(16, 18, 26, 0.95)' : 'rgba(255, 255, 255, 0.98)';
        ctx.fill();

        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Divider Line
        const divX = boxX + boxW * 0.48;
        ctx.beginPath();
        ctx.moveTo(divX, boxY + 2);
        ctx.lineTo(divX, boxY + boxH - 2);
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        ctx.stroke();

        // Day of Week
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 8.5px "Adwaita Mono", monospace';
        ctx.fillStyle = isDark ? '#3584e4' : '#1c71d8';
        ctx.fillText(dayName, boxX + boxW * 0.24, cy);

        // Day Number
        ctx.font = '700 10px "Adwaita Mono", monospace';
        ctx.fillStyle = isDark ? '#ffffff' : '#1c1c1c';
        ctx.fillText(String(dayNum).padStart(2, '0'), boxX + boxW * 0.74, cy);

        ctx.restore();
    }

    /**
     * Hour Markers, Accents, and Minute Ticks
     */
    private drawMarkersAndTicks(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, isDark: boolean): void {
        ctx.save();

        for (let i = 0; i < 60; i++) {
            const angle = i * (Math.PI / 30) - Math.PI / 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            if (i % 5 === 0) {
                // Major Hour Marker
                const isCardinal = i % 15 === 0;
                const innerR = isCardinal ? R * 0.78 : R * 0.81;
                const outerR = R * 0.93;
                const markerWidth = isCardinal ? 3.5 : 2.5;

                const x1 = cx + innerR * cos;
                const y1 = cy + innerR * sin;
                const x2 = cx + outerR * cos;
                const y2 = cy + outerR * sin;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = markerWidth;
                ctx.lineCap = 'round';

                if (isCardinal) {
                    ctx.strokeStyle = isDark ? '#ffffff' : '#1c1c1c';
                    ctx.shadowColor = isDark ? 'rgba(53, 132, 228, 0.6)' : 'rgba(28, 113, 216, 0.3)';
                    ctx.shadowBlur = 4;
                } else {
                    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(40, 45, 55, 0.85)';
                    ctx.shadowBlur = 0;
                }

                ctx.stroke();

                // Luminous Accent Pip at Major Cardinal Points
                if (isCardinal) {
                    const pipR = R * 0.74;
                    const pipX = cx + pipR * cos;
                    const pipY = cy + pipR * sin;

                    ctx.beginPath();
                    ctx.arc(pipX, pipY, 2, 0, Math.PI * 2);
                    ctx.fillStyle = isDark ? '#3584e4' : '#1c71d8';
                    ctx.fill();
                }
            } else {
                // Fine Minute Tick
                const innerR = R * 0.88;
                const outerR = R * 0.93;

                const x1 = cx + innerR * cos;
                const y1 = cy + innerR * sin;
                const x2 = cx + outerR * cos;
                const y2 = cy + outerR * sin;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = 1;
                ctx.lineCap = 'butt';
                ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.24)';
                ctx.shadowBlur = 0;
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    /**
     * Numerals (12, 3, 6, 9)
     */
    private drawNumerals(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, isDark: boolean): void {
        ctx.save();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 13px "Adwaita Mono", -apple-system, monospace';
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.9)' : '#1c1c1c';

        const numR = R * 0.67;

        // 12
        ctx.fillText('12', cx, cy - numR);

        // 6
        ctx.fillText('6', cx, cy + numR);

        // 9
        ctx.fillText('9', cx - numR, cy);

        // 3 (skip if date aperture is displayed at 3 o'clock)
        if (!this.showDateBadge()) {
            ctx.fillText('3', cx + numR, cy);
        }

        ctx.restore();
    }

    /**
     * Convex Watch Crystal Glass Specular Arc Reflection
     */
    private drawGlassReflection(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, isDark: boolean): void {
        ctx.save();

        // Clip to dial area
        ctx.beginPath();
        ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.clip();

        // Upper Crescent Specular Glass Gradient
        const glassGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R * 0.2);
        if (isDark) {
            glassGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.16)');
            glassGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
            glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
        } else {
            glassGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.55)');
            glassGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.2)');
            glassGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
        }

        ctx.beginPath();
        ctx.ellipse(cx, cy - R * 0.22, R * 0.92, R * 0.65, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = glassGrad;
        ctx.fill();

        // Bottom Edge Subtle Bounce Ambient Light
        const bottomGlow = ctx.createRadialGradient(cx, cy + R * 0.9, R * 0.05, cx, cy + R * 0.9, R * 0.45);
        bottomGlow.addColorStop(0.0, isDark ? 'rgba(53, 132, 228, 0.12)' : 'rgba(255, 255, 255, 0.4)');
        bottomGlow.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = bottomGlow;
        ctx.fill();

        ctx.restore();
    }

    /**
     * 3D Beveled Sword Hour Hand
     */
    private drawHourHand(
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        R: number,
        angle: number,
        isDark: boolean,
    ): void {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const length = R * 0.52;
        const width = R * 0.09;
        const tail = R * 0.12;

        // Hand Drop Shadow
        ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;

        // Left Chamfer Facet (Bright)
        ctx.beginPath();
        ctx.moveTo(-tail, 0);
        ctx.lineTo(0, -width / 2);
        ctx.lineTo(length, 0);
        ctx.closePath();
        ctx.fillStyle = isDark ? '#ffffff' : '#282e38';
        ctx.fill();

        // Right Chamfer Facet (Dark/Shadowed for 3D Bevel effect)
        ctx.beginPath();
        ctx.moveTo(-tail, 0);
        ctx.lineTo(0, width / 2);
        ctx.lineTo(length, 0);
        ctx.closePath();
        ctx.fillStyle = isDark ? '#98a2b5' : '#4b5563';
        ctx.fill();

        ctx.restore();
    }

    /**
     * 3D Beveled Sword Minute Hand
     */
    private drawMinuteHand(
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        R: number,
        angle: number,
        isDark: boolean,
    ): void {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const length = R * 0.76;
        const width = R * 0.07;
        const tail = R * 0.14;

        // Hand Drop Shadow
        ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 5;

        // Left Chamfer Facet (Bright)
        ctx.beginPath();
        ctx.moveTo(-tail, 0);
        ctx.lineTo(0, -width / 2);
        ctx.lineTo(length, 0);
        ctx.closePath();
        ctx.fillStyle = isDark ? '#ffffff' : '#282e38';
        ctx.fill();

        // Right Chamfer Facet (Shadowed)
        ctx.beginPath();
        ctx.moveTo(-tail, 0);
        ctx.lineTo(0, width / 2);
        ctx.lineTo(length, 0);
        ctx.closePath();
        ctx.fillStyle = isDark ? '#8a94a6' : '#475366';
        ctx.fill();

        ctx.restore();
    }

    /**
     * Ultra-Fine Needle Second Hand with Glowing Luminous Tip & Counterbalance Ring
     */
    private drawSecondHand(
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        R: number,
        angle: number,
        isDark: boolean,
    ): void {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const length = R * 0.86;
        const tail = R * 0.22;
        const accentColor = isDark ? '#3584e4' : '#1c71d8';

        // Second Hand Drop Shadow
        ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        // Needle Spine
        ctx.beginPath();
        ctx.moveTo(-tail, 0);
        ctx.lineTo(length, 0);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Counterbalance Ring at Tail
        ctx.beginPath();
        ctx.arc(-tail * 0.55, 0, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-tail * 0.55, 0, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#141620' : '#ffffff';
        ctx.fill();

        // Glowing Needle Tip Dot
        ctx.beginPath();
        ctx.arc(length - 4, 0, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#78aeed' : '#3584e4';
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.restore();
    }

    /**
     * Center Pivot Cap with Specular Ring & Blue Center Jewel
     */
    private drawCenterPivot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, isDark: boolean): void {
        ctx.save();

        const pivotOuterR = size * 0.038;
        const pivotMidR = size * 0.024;
        const jewelR = size * 0.012;

        // Outer Metallic Ring
        ctx.beginPath();
        ctx.arc(cx, cy, pivotOuterR, 0, Math.PI * 2);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = isDark ? '#2e3442' : '#cbd5e1';
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        // Middle Specular Metallic Dome
        const domeGrad = ctx.createLinearGradient(cx - pivotMidR, cy - pivotMidR, cx + pivotMidR, cy + pivotMidR);
        if (isDark) {
            domeGrad.addColorStop(0.0, '#ffffff');
            domeGrad.addColorStop(0.5, '#7b879c');
            domeGrad.addColorStop(1.0, '#2b313d');
        } else {
            domeGrad.addColorStop(0.0, '#ffffff');
            domeGrad.addColorStop(0.5, '#e2e8f0');
            domeGrad.addColorStop(1.0, '#94a3b8');
        }

        ctx.beginPath();
        ctx.arc(cx, cy, pivotMidR, 0, Math.PI * 2);
        ctx.fillStyle = domeGrad;
        ctx.fill();

        // Center Blue Jewel
        ctx.beginPath();
        ctx.arc(cx, cy, jewelR, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#3584e4' : '#1c71d8';
        ctx.shadowColor = isDark ? '#3584e4' : '#1c71d8';
        ctx.shadowBlur = 4;
        ctx.fill();

        ctx.restore();
    }

    // ==========================================
    // Interactive User Actions
    // ==========================================

    public toggleSweep(): void {
        this.smoothSeconds.update((v) => !v);
    }

    public toggleSeconds(): void {
        this.showSeconds.update((v) => !v);
    }

    public toggleNumbers(): void {
        this.showNumbers.update((v) => !v);
    }

    public toggleDateBadge(): void {
        this.showDateBadge.update((v) => !v);
    }

    public onTimezoneChange(tz: string): void {
        this.timezone.set(tz || 'local');
        this.updateLabels();
    }
}
