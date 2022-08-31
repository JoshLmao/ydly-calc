import React from "react";
import { Button, Container, Form } from "react-bootstrap";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

const _algodClient = new algosdk.Algodv2('', "https://mainnet-api.algonode.cloud", 443);

const _myAlgoWallet = new MyAlgoConnect();

const NLL_PROXY_APP_ID = 233725848;
const NLL_APP_ID = 233725844;
const ESCROW_ADDR = "FMBXOFAQCSAD4UWU4Q7IX5AV4FRV6AKURJQYGXLW3CTPTQ7XBX6MALMSPY";
const YLDY_ASA_ID = 226701642;
const ESCROW_PROGRAM_STR = "AiAGAgaYv7lvAAUBMgQiDzIEIw4QQQAuMwAYJBJAAANCACMzABAjEjMAGSUSIQQzABkSERAzASAyAxIQMwAgMgMSEEAAAiVDIQVD";

export default class NLLClaim extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            amount: 0.001,
            connectedWallet: "",// undefined,
        };
    }

    async OnConnectWallet() {
        const address = await this.ConnectMyAlgo();
        this.setState({
            connectedWallet: address ? address : this.state.connectedWallet,
        });
    }

    async ConnectMyAlgo() {
        try {
            const accounts = await _myAlgoWallet.connect();
            return accounts[0].address;
            
        }
        catch (e) {
            console.error("MyAlgo Connect error", e);
        }
    }

    async ClaimAmount() {
        if (this.state.amount && this.state.amount > 0) {
            console.log(`Claiming ${this.state.amount}`);

            const suggestedParamTxn = await _algodClient.getTransactionParams().do();
            if (!suggestedParamTxn) {
                return;
            }

            // Amount in uAlgo to claim
            const ualgoClaimAmt = this.state.amount * 1000000;

            const stringToBytes = (arg) => {
                return new Uint8Array(Buffer.from(arg));
            }

            const flavourNote = stringToBytes("NLL Claim on yldy-calculator by JoshLmao <3");

            // Call proxy contract
            const checkAppArg = stringToBytes("check");
            console.log(checkAppArg);
            const checkTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_PROXY_APP_ID, [ checkAppArg ]);

            const caAppArg =  stringToBytes("CA");
            const appAccounts = [ ESCROW_ADDR ];
            const appWithdrawTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_APP_ID, [ caAppArg ], appAccounts, undefined, undefined, flavourNote);

            // Pay for txn transfer fee
            const withdrawFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, ESCROW_ADDR, 1000, undefined, flavourNote, suggestedParamTxn);

            // Tranfer YLDY from escrow to claimer
            const claimTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(ESCROW_ADDR, this.state.connectedWallet, undefined, undefined, ualgoClaimAmt, flavourNote, YLDY_ASA_ID, suggestedParamTxn);

            console.log(ESCROW_PROGRAM_STR);
            const program = new Uint8Array(Buffer.from(ESCROW_PROGRAM_STR, "base64"));
            console.log(program);
            //const logicSig = algosdk.logicSigFromByte(program);
            const escrowLogicSig = new algosdk.LogicSigAccount(program);
            console.log(escrowLogicSig);
            const signedLogicSig = algosdk.signLogicSigTransaction(claimTxn, escrowLogicSig);
            console.log(signedLogicSig);

            const groupedTxns = algosdk.assignGroupID([
                checkTxn,
                appWithdrawTxn,
                withdrawFeeTxn,
                //signedLogicSig,
            ]);

            let signed = null;
            try {
                signed = await _myAlgoWallet.signTransaction(groupedTxns.map(x => x.toByte()));
            }   
            catch (e) {
                console.error("Sign txn error", e);
            }

            console.log("signed all");
            console.log(signed);
            if (signed) {
                console.log("Sending txns");
                const allBlobs = signed.map(x => x.blob);
                const published = await _algodClient.sendRawTransaction(allBlobs).do().catch(x => console.error("Error publishing txns", x));
                if (published) {
                    console.log("Published good!", published);
                }
                else {
                    console.error("Not published!");
                }
            }

        }
    }

    render() {
        return (
            <Container
                className="mb-3 mt-2 border border-primary rounded p-3"
                >
                <div
                    className="d-flex flex-column mb-3"
                    >
                    <Button
                        variant="primary"
                        className="mx-auto"
                        onClick={ async () => {
                            this.OnConnectWallet({ shouldSelectOneAccount: true, });
                        }}
                        >     
                        Connect/Change Wallet               
                    </Button>
                    {
                        this.state.connectedWallet && (
                            <div
                                className="text-primary mx-auto"
                                >
                                { this.state.connectedWallet }
                            </div>
                        )
                    }
                </div>
                <div
                    className="d-flex"
                    >
                    <div
                        className="me-3"
                        >
                        Amount in Algos:
                    </div>
                    <Form.Control
                        value={ this.state.amount }
                        onChange={ (e) => {
                            this.setState({ amount: e.target.value });
                        }}
                        type="number"
                        className="mx-3"
                        />
                    <Button
                        className="ms-3"
                        variant="outline-primary"
                        onClick={ async () => {
                            await this.ClaimAmount();
                        }}
                        >
                        Claim!
                    </Button>
                </div>
            </Container>
        )
    }

}