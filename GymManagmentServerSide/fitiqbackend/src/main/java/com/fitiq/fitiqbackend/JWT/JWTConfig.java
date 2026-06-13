package com.fitiq.fitiqbackend.JWT;

import java.util.Date;

import javax.crypto.SecretKey;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JWTConfig {
    
    // set a secret key
    private static String secretkey = "eX7!9lXbG%hJwQz6*Rm5fW2@P8!@#%eX7!9lXbG%hJwQz6*Rm5fW2@P8";


    public static SecretKey getSignKey(){
        byte[] keyBytes = secretkey.getBytes(); // Or use Base64 decoding if key is Base64
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public static String generateToken(String userid, String role) {

        return Jwts.builder()
                .subject(userid)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))  // 10 hours
                .signWith(getSignKey())  
                .compact();  // compact the JWT into a string
    }
    


    // Validate the generated token
    public static boolean validateToken(String token){
        try {
            SecretKey key = Keys.hmacShaKeyFor(secretkey.getBytes());
    
            // Use parserBuilder to create a parser and validate the token
            Jwts.parser()
                .verifyWith(key) // validate signature with secret key
                .build()
                .parseSignedClaims(token); // parse and validate token
    
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Method to extract username (subject) from token
    public static String extractUserId(String token) {

        SecretKey key = Keys.hmacShaKeyFor(secretkey.getBytes());
    
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject(); // This is your email or username
    }

    public static String extractRole(String token) {

     SecretKey key = Keys.hmacShaKeyFor(secretkey.getBytes());

     return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("role", String.class);
     }

}

