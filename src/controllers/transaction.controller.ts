import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const MERCHANT_ID = process.env.CORE_MERCHANT_ID;
const USERNAME = process.env.CORE_USERNAME;
const PASSWORD = process.env.CORE_PASSWORD;
const CALLBACK_URL = process.env.CORE_CALLBACK_URL;
import uuid from 'uuid';
import { checkWithdrawalProccess } from '../services/transactions';
export const requestTransaction = async (req: Request, res: Response): Promise<void> => {
    const { type, clientId, clientLogin,operation_unique_id, amount, currency, merchantId } = req.body;

    try {
        await checkWithdrawalProccess()
        const transaction_id = `TXN_${new Date().getTime()}}`;
        // Save to DB
        const transaction = await Transaction.create({
            operation_unique_id,
            // matched_with,//from withdrawal
            // points,//from withdrawal
            transaction_id,
            // user_id,//from withdrawal
            // vendor_id,//from withdrawal
            amount,
            currency,
            type,
            // application_used,//from withdrawal
            clientId,
        });
        // transaction.redirectUrl = redirectUrl;
        await transaction.save();

        res.status(200).json({
            message: 'Transaction initiated successfully',
            // redirectUrl,
            transactionId: transaction.id,
        });
    } catch (err: any) {
        console.error('Request Transaction Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const callback = async (req: Request, res: Response): Promise<void> => {
    // const {
    //     Result,
    //     OperationUniqueId,
    //     Message,
    //     RequestId,
    //     TraceNumber,
    //     TransactionDate,
    //     ApiToken
    // } = req.body;

    // try {
    //     const transaction = await Transaction.findOne({
    //         where: { operationUniqueId: OperationUniqueId }
    //     });

    //     if (!transaction) {
    //         res.status(404).json({ error: 'Transaction not found' });
    //         return;
    //     }

    //     transaction.result = Result === 'True';
    //     transaction.message = Message;
    //     transaction.requestId = RequestId;
    //     transaction.traceNumber = TraceNumber;
    //     transaction.transactionDate = new Date(TransactionDate);

    //     // Call VerifyTransaction
    //     const verifyResponse = await axios.post(
    //         'https://api.coregateways.com/api/V1/Merchant/VerifyTransaction',
    //         {
    //             MerchantId: MERCHANT_ID,
    //             Username: USERNAME,
    //             Password: PASSWORD,
    //             OperationUniqueId: OperationUniqueId,
    //             OperationAmount: transaction.amount,
    //             ClientId: transaction.clientId,
    //             Result: Result === 'True',
    //             Currency: transaction.currency,
    //         },
    //         {
    //             headers: {
    //                 Authorization: ApiToken,
    //             },
    //         }
    //     );

    //     const verifyResult = verifyResponse.data.Result;

    //     if (verifyResult === 0) {
    //         transaction.verified = true;
    //         await transaction.save();
    //         res.status(200).json({ message: 'Transaction verified successfully' });
    //     } else {
    //         await transaction.save();
    //         res.status(400).json({ error: 'Verification failed', code: verifyResult });
    //     }

    // } catch (err: any) {
    //     console.error('Callback processing error:', err.message);
    //     res.status(500).json({ error: 'Internal server error' });
    // }
};
export const verify = async (req: Request, res: Response): Promise<void> => {}