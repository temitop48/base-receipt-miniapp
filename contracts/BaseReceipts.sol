// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BaseReceipts
 * @dev NFT contract for minting transaction receipts on Base
 * Each receipt represents a Base transaction with custom metadata
 */
contract BaseReceipts is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from transaction hash to token ID
    mapping(string => uint256) public txHashToTokenId;
    
    // Mapping to check if a transaction has been minted
    mapping(string => bool) public isMinted;

    event ReceiptMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string txHash,
        string metadataURI
    );

    constructor() ERC721("Base Receipts", "RECEIPT") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a receipt NFT for a transaction
     * @param txHash The transaction hash this receipt represents
     * @param metadataURI The metadata URI containing receipt details
     * @return tokenId The ID of the newly minted receipt
     */
    function mintReceipt(
        string memory txHash,
        string memory metadataURI
    ) public returns (uint256) {
        require(!isMinted[txHash], "Receipt already minted for this transaction");
        require(bytes(txHash).length > 0, "Transaction hash required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        uint256 tokenId = _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        txHashToTokenId[txHash] = tokenId;
        isMinted[txHash] = true;

        emit ReceiptMinted(msg.sender, tokenId, txHash, metadataURI);

        return tokenId;
    }

    /**
     * @dev Check if a receipt exists for a transaction
     * @param txHash The transaction hash to check
     * @return bool True if a receipt has been minted for this transaction
     */
    function receiptExists(string memory txHash) public view returns (bool) {
        return isMinted[txHash];
    }

    /**
     * @dev Get the token ID for a transaction hash
     * @param txHash The transaction hash to look up
     * @return tokenId The token ID, or 0 if not minted
     */
    function getTokenIdByTxHash(string memory txHash) public view returns (uint256) {
        return txHashToTokenId[txHash];
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
