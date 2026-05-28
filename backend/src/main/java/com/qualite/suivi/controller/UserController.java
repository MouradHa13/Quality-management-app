package com.qualite.suivi.controller;

import com.qualite.suivi.model.Role;
import com.qualite.suivi.model.Utilisateur;
import com.qualite.suivi.repository.RoleRepository;
import com.qualite.suivi.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE')")
    public List<Utilisateur> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        
        System.out.println("DEBUG: getAllUsers called with search='" + search + "' and role='" + role + "'");
        
        List<Utilisateur> users;
        if (search != null && !search.isEmpty()) {
            users = utilisateurRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, search);
            System.out.println("DEBUG: Found " + users.size() + " users matching '" + search + "'");
        } else {
            users = utilisateurRepository.findAll();
        }

        if (role != null && !role.isEmpty()) {
            List<Utilisateur> filtered = users.stream()
                    .filter(u -> u.getRoles() != null && u.getRoles().stream()
                            .anyMatch(r -> role.equalsIgnoreCase(r.getNomRole())))
                    .toList();
            System.out.println("DEBUG: After role filter '" + role + "', " + filtered.size() + " users remain");
            return filtered;
        }

        return users;
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Utilisateur toggleStatus(@PathVariable String id) {
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow();
        user.setActif(!user.isActif());
        return utilisateurRepository.save(user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE')")
    public Utilisateur getUser(@PathVariable String id) {
        return utilisateurRepository.findById(id).orElseThrow();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteUser(@PathVariable String id) {
        utilisateurRepository.deleteById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public Utilisateur createUser(@RequestBody Utilisateur user) {
        if (utilisateurRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        user.setMotDePasse(encoder.encode(user.getMotDePasse()));
        
        // Map roles names to objects if only names are provided
        if (user.getRoles() != null) {
            Set<Role> roles = new HashSet<>();
            user.getRoles().forEach(role -> {
                roleRepository.findByNomRole(role.getNomRole()).ifPresent(roles::add);
            });
            user.setRoles(roles);
        }

        return utilisateurRepository.save(user);
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("#id == authentication.principal.id or hasAuthority('ADMIN')")
    public void changePassword(@PathVariable String id, @RequestBody com.qualite.suivi.dto.PasswordChangeRequest request) {
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow();
        
        if (!encoder.matches(request.getOldPassword(), user.getMotDePasse())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        user.setMotDePasse(encoder.encode(request.getNewPassword()));
        utilisateurRepository.save(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasAuthority('ADMIN')")
    public Utilisateur updateUser(@PathVariable String id, @RequestBody Utilisateur userDetails) {
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow();
        user.setNom(userDetails.getNom());
        user.setPrenom(userDetails.getPrenom());
        if (userDetails.getRoles() != null && !userDetails.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            userDetails.getRoles().forEach(role -> {
                roleRepository.findByNomRole(role.getNomRole()).ifPresent(roles::add);
            });
            user.setRoles(roles);
        }
        return utilisateurRepository.save(user);
    }

    @PatchMapping("/{id}/reset-password-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void resetPasswordAdmin(@PathVariable String id, @RequestBody String newPassword) {
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow();
        user.setMotDePasse(encoder.encode(newPassword));
        utilisateurRepository.save(user);
    }
}
