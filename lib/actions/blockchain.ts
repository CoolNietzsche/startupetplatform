'use server'

import { ethers } from 'ethers';
import { ensureAdmin, ensureAuthenticated } from '@/lib/security';

// Smart contract ABI for certificate verification
const CONTRACT_ABI = [
    "function verifyCertificate(bytes32 hash) view returns (bool)",
    "function registerCertificate(bytes32 hash)",
];

export async function registerCertificateOnBlockchain(certificateHash: string) {
    await ensureAdmin();
    if (!process.env.ETHEREUM_PRIVATE_KEY || !process.env.ETHEREUM_RPC_URL) {
        throw new Error('Ethereum configuration not found');
    }

    try {
        // Connect to Ethereum network
        const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        const wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
        
        // Connect to smart contract
        const contract = new ethers.Contract(
            process.env.CERTIFICATE_CONTRACT_ADDRESS!,
            CONTRACT_ABI,
            wallet
        );

        // Register certificate hash
        const tx = await contract.registerCertificate(certificateHash);
        await tx.wait();

        return {
            success: true,
            transactionHash: tx.hash,
        };
    } catch (error) {
        console.error('Blockchain registration error:', error);
        throw new Error('Failed to register certificate on blockchain');
    }
}

export async function verifyCertificateOnBlockchain(certificateHash: string) {
    await ensureAuthenticated();
    if (!process.env.ETHEREUM_RPC_URL) {
        throw new Error('Ethereum configuration not found');
    }

    try {
        // Connect to Ethereum network
        const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        
        // Connect to smart contract
        const contract = new ethers.Contract(
            process.env.CERTIFICATE_CONTRACT_ADDRESS!,
            CONTRACT_ABI,
            provider
        );

        // Verify certificate hash
        const isValid = await contract.verifyCertificate(certificateHash);

        return {
            success: true,
            isValid,
        };
    } catch (error) {
        console.error('Blockchain verification error:', error);
        throw new Error('Failed to verify certificate on blockchain');
    }
}
