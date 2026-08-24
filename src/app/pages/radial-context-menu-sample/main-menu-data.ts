import type { MenuItem } from '@components/radial-context-menu/radial-context-menu.component';
import homeSvg from '@app/assets/radial-context-menu/home.svg?raw';
import editSvg from '@app/assets/radial-context-menu/edit.svg?raw';
import searchSvg from '@app/assets/radial-context-menu/search.svg?raw';
import settingsSvg from '@app/assets/radial-context-menu/settings.svg?raw';
import shareSvg from '@app/assets/radial-context-menu/share.svg?raw';
import userSvg from '@app/assets/radial-context-menu/user.svg?raw';

export const emojiMenuItems: MenuItem[] = [
    {
        name: 'home',
        image: '🏠',
        children: [
            { name: 'dashboard', image: '📊' },
            { name: 'analytics', image: '📈' },
            {
                name: 'reports',
                image: '📝',
                children: [
                    { name: 'annual', image: '📅' },
                    { name: 'monthly', image: '📆' },
                    {
                        name: 'weekly',
                        image: '🗓️',
                        children: [
                            { name: 'draft', image: '📋' },
                            { name: 'final', image: '✅' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: 'edit',
        image: '✏️',
        children: [
            { name: 'copy', image: '📋' },
            { name: 'paste', image: '📥' },
            { name: 'cut', image: '✂️' },
        ],
    },
    { name: 'delete', image: '🗑️' },
    {
        name: 'share',
        image: '🔗',
        children: [
            { name: 'email', image: '📧' },
            { name: 'twitter', image: '🐦' },
            { name: 'facebook', image: '👥' },
        ],
    },
    { name: 'settings', image: '⚙️' },
    { name: 'profile', image: '👤' },
];

export const svgMenuItems: MenuItem[] = [
    {
        name: 'home',
        image: homeSvg,
        children: [
            { name: 'search', image: searchSvg },
            { name: 'user', image: userSvg },
            {
                name: 'settings',
                image: settingsSvg,
                children: [
                    { name: 'edit', image: editSvg },
                    { name: 'share', image: shareSvg },
                ],
            },
        ],
    },
    {
        name: 'edit',
        image: editSvg,
        children: [
            { name: 'search', image: searchSvg },
            { name: 'share', image: shareSvg },
        ],
    },
    {
        name: 'search',
        image: searchSvg,
    },
    {
        name: 'share',
        image: shareSvg,
        children: [
            { name: 'user', image: userSvg },
            { name: 'home', image: homeSvg },
        ],
    },
    {
        name: 'settings',
        image: settingsSvg,
    },
    {
        name: 'user',
        image: userSvg,
    },
];

export const mainMenuItems = emojiMenuItems;
