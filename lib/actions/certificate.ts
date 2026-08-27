'use server'

import { ethers } from 'ethers';
import db from "@/lib/db";
import path from 'path';
import fs from 'fs/promises';
import { ensureAdmin } from '@/lib/security';

// Certificate template configuration
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const CERTIFICATE_BACKGROUND = '#FFFFFF';

export async function generateCertificateHash(applicationId: string): Promise<string> {
    await ensureAdmin();
    const application = await db.application.findUnique({
        where: { id: applicationId },
        include: {
            user: true,
        }
    });

    if (!application) {
        throw new Error('Application not found');
    }

    // Create a hash of the certificate data
    const certificateData = {
        applicationId: application.id,
        startupName: application.startupName,
        ownerName: `${application.user.firstName} ${application.user.lastName}`,
        issueDate: new Date().toISOString(),
        status: application.status,
    };

    const hash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(certificateData))
    );

    return hash;
}

export async function generateCertificate(applicationId: string, includeBlockchain: boolean = false) {
    await ensureAdmin();
    const application = await db.application.findUnique({
        where: { id: applicationId },
        include: {
            user: true,
        }
    });

    if (!application) {
        throw new Error('Application not found');
    }

    if (application.status !== 'COMMITTEE_REVIEW_SUBMITTED' && application.status !== 'CERTIFIED') {
        throw new Error('Cannot generate certificate for non-accepted applications');
    }

    // Lazily require canvas so it doesn't break the build during static analysis
    let createCanvas;
    try {
        const canvasModule = require('canvas');
        createCanvas = canvasModule.createCanvas;
    } catch (e) {
        console.error("Canvas module is not installed or not supported on this environment.", e);
        throw new Error("PDF/Image certificate generation is currently unavailable on this platform.");
    }

    // Create canvas
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Set background
    ctx.fillStyle = CERTIFICATE_BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Add border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;
    ctx.strokeRect(50, 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);

    // Add title
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText('Certificate of Registration', CANVAS_WIDTH / 2, 200);

    // Add startup details
    ctx.font = '40px Arial';
    ctx.fillText(`This is to certify that`, CANVAS_WIDTH / 2, 350);
    
    ctx.font = 'bold 60px Arial';
    ctx.fillText(application.startupName || 'Unnamed Startup', CANVAS_WIDTH / 2, 450);
    
    ctx.font = '40px Arial';
    ctx.fillText(`owned by ${application.user.firstName} ${application.user.lastName}`, CANVAS_WIDTH / 2, 550);
    ctx.fillText(`has been successfully registered with StartupET`, CANVAS_WIDTH / 2, 650);

    // Add date
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.fillText(`Issued on ${date}`, CANVAS_WIDTH / 2, 750);

    // If blockchain verification is requested, add the hash
    let certificateHash = '';
    if (includeBlockchain) {
        certificateHash = await generateCertificateHash(applicationId);
        ctx.font = '20px Arial';
        ctx.fillText(`Blockchain Verification Hash:`, CANVAS_WIDTH / 2, 850);
        ctx.fillText(certificateHash, CANVAS_WIDTH / 2, 890);
    }

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Save to disk (you might want to use cloud storage in production)
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    await fs.mkdir(certificatesDir, { recursive: true });
    
    const fileName = `certificate-${applicationId}.png`;
    const filePath = path.join(certificatesDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Store certificate information in database
    const certificateRecord = await db.certificate.create({
        data: {
            applicationId: application.id,
            filePath: `/certificates/${fileName}`,
            blockchainHash: certificateHash || null,
            issuedAt: new Date(),
        },
    });

    return {
        certificateId: certificateRecord.id,
        filePath: certificateRecord.filePath,
        blockchainHash: certificateRecord.blockchainHash,
    };
}
