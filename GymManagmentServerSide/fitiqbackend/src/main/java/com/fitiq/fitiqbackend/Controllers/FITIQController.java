package com.fitiq.fitiqbackend.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FITIQController {

    @GetMapping("/")
    public String HelloToServer(){

        return "index.html";
        
    }
    
}
