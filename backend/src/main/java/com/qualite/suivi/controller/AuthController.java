package com.qualite.suivi.controller;

import com.qualite.suivi.dto.ForgotPasswordRequest;
import com.qualite.suivi.dto.JwtResponse;
import com.qualite.suivi.dto.LoginRequest;
import com.qualite.suivi.dto.MessageResponse;
import com.qualite.suivi.dto.SignupRequest;
import com.qualite.suivi.model.Role;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.repository.RoleRepository;
import com.qualite.suivi.repository.StructureRepository;
import com.qualite.suivi.repository.UtilisateurRepository;
import com.qualite.suivi.security.JwtUtils;
import com.qualite.suivi.security.UserDetailsImpl;
import com.qualite.suivi.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UtilisateurRepository utilisateurRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    StructureRepository structureRepository;

    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    NotificationService notificationService;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Utilisateur user = utilisateurRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: Utilisateur non trouvé."));

        if (!user.isActif()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Votre compte est inactif. Veuillez contacter l'administrateur."));
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, "Bearer",
                userDetails.getId(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            utilisateurRepository.findByEmail(userDetails.getEmail()).ifPresent(user -> {
                user.setLastSeen(null); // Clear lastSeen to show as offline
                utilisateurRepository.save(user);
            });
        }
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (utilisateurRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        Utilisateur user = new Utilisateur();
        user.setNom(signUpRequest.getNom());
        user.setEmail(signUpRequest.getEmail());
        user.setMotDePasse(encoder.encode(signUpRequest.getPassword()));
        user.setType(signUpRequest.getType());

        if (signUpRequest.getStructureId() != null) {
            structureRepository.findById(signUpRequest.getStructureId()).ifPresent(user::setStructure);
        }

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByNomRole("CHEF_PROJET")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.trim().toUpperCase()) {
                    case "ADMIN":
                    case "ROLE_ADMIN":
                        Role adminRole = roleRepository.findByNomRole("ADMIN")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "PILOTE":
                    case "PILOTE_QUALITE":
                    case "ROLE_PILOTE_QUALITE":
                    case "PILOTE_DE_QUALITE":
                        Role piloteRole = roleRepository.findByNomRole("PILOTE_QUALITE")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(piloteRole);
                        break;
                    case "CHEF":
                    case "CHEF_PROJET":
                    case "ROLE_CHEF_PROJET":
                    case "CHEF_DE_PROJET":
                        Role chefRole = roleRepository.findByNomRole("CHEF_PROJET")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(chefRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByNomRole("CHEF_PROJET")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        utilisateurRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        System.out.println("DEBUG: Password reset request for email: " + request.getEmail());
        utilisateurRepository.findByEmail(request.getEmail()).ifPresentOrElse(user -> {
            System.out.println("DEBUG: User found: " + user.getNom());
            String message = "Demande de réinitialisation de mot de passe pour : " + user.getNom() + " (" + user.getEmail() + ")";
            notificationService.notifyAdmins(message, "WARNING");
        }, () -> {
            System.out.println("DEBUG: User NOT found for email: " + request.getEmail());
        });
        
        return ResponseEntity.ok(new MessageResponse("Si votre email existe dans notre base, l'administrateur a été notifié."));
    }
}
